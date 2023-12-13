import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Prompt } from "../entities/Prompt";

const promptRepository = AppDataSource.getRepository(Prompt);

export const createPrompt = async (
  req: Request & { userId: number },
  res: Response
) => {
  try {
    let icon = null;
    if (req?.file) {
      const serverUrl =
        process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
      icon = `${serverUrl}/uploads/${req.file.filename}`;
    }
    const promptObject = {
      name: req?.body?.name,
      prompt: req?.body?.prompt,
      user_id: req?.userId,
      is_default: req?.body?.is_default === "true" ? true : false,
      order: req?.body?.order,
      is_active: req?.body?.is_active === "true" ? true : false,
      ai_tool: req?.body?.ai_tool,
      icon,
    };
    const newPrompt = promptRepository.create(promptObject);
    const prompt = await promptRepository.save(newPrompt);
    res.json({ prompt, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create prompt.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const getAllPrompts = async (
  req: Request & { userId: number },
  res: Response
) => {
  try {
    const { search, start_date, end_date, page, limit } = req.query;

    let query = promptRepository
      .createQueryBuilder("prompt")
      .leftJoinAndSelect("prompt.user", "user")
      .where("user.id = :userId OR prompt.is_default = :isDefault", {
        userId: req?.userId,
        isDefault: true,
      });

    // Apply search filter
    if (search) {
      query = query.andWhere(
        "(prompt.name LIKE :search OR prompt.prompt LIKE :search)",
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
        "(prompt.createdAt >= :start_date AND prompt.createdAt < :end_date)",
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
    query.orderBy("prompt.is_default", "DESC");
    query.addOrderBy("prompt.order", "ASC");
    query.addOrderBy("prompt.createdAt", "DESC");

    const [prompts, total] = await query.getManyAndCount();

    const paginationData = {
      page: pageNumber,
      pageSize,
      total,
    };

    res.json({ prompts, paginationData, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch prompts.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};

export const getPromptById = async (req: Request, res: Response) => {
  try {
    const prompt = await promptRepository.findOne({
      where: {
        id: Number(req?.params?.promptId || 0),
      },
      relations: ["user"],
    });
    if (!!prompt) {
      res.json({ prompt, success: true });
    } else {
      res.json({
        message: `Prompt not found with id ${req?.params?.promptId}`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch prompt.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const updatePromptById = async (req: Request, res: Response) => {
  try {
    const promptId = Number(req.params.promptId || 0);
    const prompt = await promptRepository.findOne({
      where: {
        id: promptId,
      },
    });

    if (prompt) {
      let icon = null;
      if (req?.file) {
        const serverUrl =
          process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
        icon = `${serverUrl}/uploads/${req.file.filename}`;
      }
      prompt.name = req.body.name || prompt.name;
      prompt.prompt = req.body.prompt || prompt.prompt;
      prompt.user_id = req.body.user_id || prompt.user_id;
      prompt.is_default = req.body.is_default === "true" ? true : false;
      prompt.order = req.body.order || prompt?.order;
      prompt.is_active = req.body.is_active === "true" ? true : false;
      prompt.icon = icon || prompt?.icon;
      prompt.ai_tool = req.body.ai_tool || prompt?.ai_tool;

      await promptRepository.save(prompt);
      const promptDetails = await promptRepository.findOne({
        where: {
          id: promptId,
        },
        relations: ["user"],
      });
      res.json({ prompt: promptDetails, success: true });
    } else {
      res.status(404).json({
        message: `Prompt not found with id ${promptId}`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to update prompt.",
      success: false,
      ...(error.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};

export const deletePromptById = async (req: Request, res: Response) => {
  try {
    const promptId = Number(req.params.promptId || 0);
    const prompt = await promptRepository.findOne({
      where: {
        id: promptId,
      },
    });

    if (prompt) {
      await promptRepository.remove(prompt);
      res.json({ success: true });
    } else {
      res.status(404).json({
        message: `Prompt not found with id ${promptId}`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete prompt.",
      success: false,
      ...(error.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};
