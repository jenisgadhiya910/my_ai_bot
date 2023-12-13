import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Setting } from "../entities/Setting";

const settingRepository = AppDataSource.getRepository(Setting);

export const createSetting = async (
  req: Request & { userId: number },
  res: Response
) => {
  try {
    const settingObject = {
      service_name: req.body?.service_name,
      api_key: req.body?.api_key,
      api_secret: req.body?.api_secret || null,
      user_id: req?.userId,
    };
    const newSetting = settingRepository.create(settingObject);
    const setting = await settingRepository.save(newSetting);
    res.json({ setting, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create setting.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const getAllSettings = async (
  req: Request & { userId: number },
  res: Response
) => {
  try {
    const { search, page, limit } = req.query;

    let query = settingRepository
      .createQueryBuilder("setting")
      .leftJoinAndSelect("setting.user", "user")
      .where("user.id = :userId", { userId: req?.userId });

    // Apply search filter
    if (search) {
      query = query.where(
        "setting.service_name LIKE :search OR setting.api_key LIKE :search",
        { search: `%${search}%` }
      );
    }

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;
    query = query.skip(skip).take(take);
    query.orderBy("setting.createdAt", "DESC");

    const [settings, total] = await query.getManyAndCount();

    const paginationData = {
      page: pageNumber,
      pageSize,
      total,
    };

    res.json({ settings, paginationData, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch settings.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const getSettingById = async (req: Request, res: Response) => {
  try {
    const setting = await settingRepository.findOne({
      where: {
        id: Number(req.params.settingId || 0),
      },
    });
    if (setting) {
      res.json({ setting, success: true });
    } else {
      res.json({
        message: `Setting not found with id ${req.params.settingId}`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch setting.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const updateSettingById = async (req: Request, res: Response) => {
  try {
    const settingId = Number(req.params.settingId || 0);
    const setting = await settingRepository.findOne({
      where: {
        id: settingId,
      },
    });

    if (setting) {
      setting.service_name = req.body.service_name || setting.service_name;
      setting.api_key = req.body.api_key || setting.api_key;
      setting.api_secret = req.body?.api_secret || setting?.api_secret || null;

      await settingRepository.save(setting);
      const settingDetails = await settingRepository.findOne({
        where: {
          id: settingId,
        },
      });
      res.json({ setting: settingDetails, success: true });
    } else {
      res.status(404).json({
        message: `Setting not found with id ${settingId}`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to update setting.",
      success: false,
      ...(error.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};

export const deleteSettingById = async (req: Request, res: Response) => {
  try {
    const settingId = Number(req.params.settingId || 0);
    const setting = await settingRepository.findOne({
      where: {
        id: settingId,
      },
    });

    if (setting) {
      await settingRepository.remove(setting);
      res.json({ success: true });
    } else {
      res.status(404).json({
        message: `Setting not found with id ${settingId}`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete setting.",
      success: false,
      ...(error.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};
