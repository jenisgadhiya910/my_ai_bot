import { Request, Response } from "express";
import { User } from "../entities/User";
import { AppDataSource } from "../database/data-source";
import * as jwt from "jsonwebtoken";
import * as bcypt from "bcryptjs";
import * as sgMail from "@sendgrid/mail";
const userRepository = AppDataSource?.getRepository(User);

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user || !user.checkPassword(password)) {
      return res.status(401).json({
        message: "Invalid email or password.",
        success: false,
      });
    }

    const token = jwt.sign({ userId: user.id }, "your-secret-key", {
      expiresIn: "24h",
    });

    res.json({ user, token, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to login.",
      success: false,
      ...(error.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const userObject = {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      role: req?.body?.role || "user",
      password: req?.body?.password,
      organization: req?.body?.organization,
    };
    const newUser = userRepository.create(userObject);
    newUser.setPassword(req?.body?.password);
    const user = await userRepository.save(newUser);
    res.json({ user, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to signup user.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = req?.body?.email;
    const user = await userRepository?.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      return res.json({ success: true });
    }
    user.reset_password_token = bcypt.hashSync(
      JSON.stringify({ ...user, date: new Date().toISOString() }),
      10
    );
    user.reset_password_sent_at = new Date();
    await userRepository.save(user);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: user.email,
      from: process.env.RESET_PASSWORD_FROM_EMAIL,
      templateId: process.env.SENDGRID_RESET_PASSWORD_TEMPLATE_ID,
      dynamicTemplateData: {
        first_name: user.firstName,
        reset_url: `${process.env.FRONTEND_URL}/auth/reset-password?token=${user.reset_password_token}`,
      },
    };
    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send reset password email",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const resetPasswordToken = req.body?.reset_token;
    const password = req.body?.password;
    const user = await userRepository.findOne({
      where: {
        reset_password_token: resetPasswordToken,
      },
    });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Access expired or incorrect.",
      });
    }
    const tokenExpirationTime = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    const currentTime = new Date().getTime();
    const tokenSentTime = new Date(user.reset_password_sent_at).getTime();
    if (currentTime - tokenSentTime > tokenExpirationTime) {
      return res.status(400).send({
        success: false,
        message: "Reset token has expired. Please request a new one.",
      });
    }
    user.reset_password_token = null;
    user.reset_password_sent_at = null;
    user.setPassword(password);
    await userRepository.save(user);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reset new password",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};
