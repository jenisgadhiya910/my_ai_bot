import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";

const userRepository = AppDataSource.getRepository(User);

export const createUser = async (req: Request, res: Response) => {
  try {
    let avatar = null;
    if (req?.file) {
      const serverUrl =
        process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
      avatar = `${serverUrl}/uploads/${req.file.filename}`;
    }
    const userObject = {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      role: req?.body?.role,
      password: req?.body?.password,
      avatar,
      organization: req?.body?.organization,
    };
    const newUser = userRepository.create(userObject);
    newUser.setPassword(req?.body?.password);
    const user = await userRepository.save(newUser);
    res.json({ user, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create user.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, start_date, end_date, page, limit } = req.query;

    let query = userRepository.createQueryBuilder("user");

    // Apply search filter
    if (search) {
      query = query.where(
        "user.firstName LIKE :search OR user.lastName LIKE :search",
        { search: `%${search}%` }
      );
    }

    // Apply date range filter
    if (start_date && end_date) {
      const startDate = new Date(start_date as string);
      const endDate = new Date(end_date as string);
      const endDatePlusOneDay = new Date(
        endDate.getTime() + 24 * 60 * 60 * 1000
      ); // Add 1 day to the end date
      query = query.andWhere(
        "user.createdAt >= :start_date AND user.createdAt < :end_date",
        {
          start_date: startDate,
          end_date: endDatePlusOneDay,
        }
      );
    }

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;
    query = query.skip(skip).take(take);
    query.orderBy("user.createdAt", "DESC");

    const [users, total] = await query.getManyAndCount();

    const paginationData = {
      page: pageNumber,
      pageSize,
      total,
    };

    res.json({ users, paginationData, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userRepository?.findOne({
      where: {
        id: Number(req?.params?.userId || 0),
      },
      relations: ["prompts", "histories", "payment"],
    });
    if (!!user) {
      res.json({ user, success: true });
    } else {
      res.json({
        message: `User not found with id ${req?.params?.userId}`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to create user.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const updateUserById = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId || 0);
    const user = await userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ["prompts", "histories", "payment"],
    });

    if (user) {
      let avatar = null;
      if (req?.file) {
        const serverUrl =
          process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
        avatar = `${serverUrl}/uploads/${req.file.filename}`;
      }
      user.firstName = req.body?.firstName || user.firstName;
      user.lastName = req.body?.lastName || user.lastName;
      user.email = req.body?.email || user.email;
      user.role = req.body?.role || user.role;
      user.avatar = avatar || user?.avatar;
      if ("organization" in req?.body)
        user.organization = req.body?.organization || "";
      if ("profile" in req?.body) user.profile = req.body?.profile || "";
      if ("organization_profile" in req?.body)
        user.organization_profile = req.body?.organization_profile || "";
      user.mode_input = req.body?.mode_input || user?.mode_input || null;
      user.mode_value = req.body?.mode_value || user?.mode_value || null;

      if (req.body?.password) {
        user.setPassword(req.body?.password);
      }

      await userRepository.save(user);
      res.json({ user, success: true });
    } else {
      res.status(404).json({
        message: `User not found with id ${userId}`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user.",
      success: false,
      ...(error.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};

export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId || 0);
    const user = await userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (user) {
      await userRepository.delete(user.id);
      res.json({ success: true });
    } else {
      res.status(404).json({
        message: `User not found with id ${userId}`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user.",
      success: false,
      ...(error.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};
