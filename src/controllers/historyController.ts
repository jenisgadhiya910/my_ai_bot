import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { History } from "../entities/History";

const historyRepository = AppDataSource.getRepository(History);

export const createHistory = async (req: Request, res: Response) => {
  try {
    const historyObject = {
      name: req?.body?.name,
      user_id: req?.body?.user_id,
    };
    const newHistory = historyRepository.create(historyObject);
    const history = await historyRepository.save(newHistory);
    res.json({ history, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create history.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const getAllHistories = async (
  req: Request & { userId: number },
  res: Response
) => {
  try {
    const { search, start_date, end_date, page, limit } = req.query;

    let query = historyRepository
      .createQueryBuilder("history")
      .leftJoinAndSelect("history.user", "user")
      .leftJoinAndSelect("history.chats", "chats")
      .where("user.id = :userId", { userId: req?.userId });

    // Apply search filter
    if (search) {
      query = query.where("history.name LIKE :search", {
        search: `%${search}%`,
      });
    }

    // Apply date range filter
    if (start_date && end_date) {
      const startDate = new Date(start_date as string);
      const endDate = new Date(end_date as string);
      const endDatePlusOneDay = new Date(
        endDate.getTime() + 24 * 60 * 60 * 1000
      ); // Add 1 day to the end date
      query = query.andWhere(
        "prompt.createdAt >= :start_date AND prompt.createdAt < :end_date",
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
    query = query.orderBy("history.updatedAt", "DESC").skip(skip).take(take);

    const [histories, total] = await query.getManyAndCount();

    const paginationData = {
      page: pageNumber,
      pageSize,
      total,
    };

    res.json({ histories, paginationData, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch histories.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const getHistoryById = async (req: Request, res: Response) => {
  try {
    const history = await historyRepository.findOne({
      where: {
        id: Number(req?.params?.historyId || 0),
      },
      relations: ["user", "chats"],
    });
    if (!!history) {
      res.json({ history, success: true });
    } else {
      res.json({
        message: `History not found with id ${req?.params?.historyId}`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch history.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const updateHistoryById = async (req: Request, res: Response) => {
  try {
    const historyId = Number(req.params.historyId || 0);
    const history = await historyRepository.findOne({
      where: {
        id: historyId,
      },
    });

    if (history) {
      history.name = req.body.name || history.name;
      history.user_id = req.body.user_id || history.user_id;

      await historyRepository.save(history);
      const historyDetails = await historyRepository.findOne({
        where: {
          id: historyId,
        },
        relations: ["user"],
      });
      res.json({ history: historyDetails, success: true });
    } else {
      res.status(404).json({
        message: `History not found with id ${historyId}`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to update history.",
      success: false,
      ...(error.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};

export const deleteHistoryById = async (req: Request, res: Response) => {
  try {
    const historyId = Number(req.params.historyId || 0);
    const history = await historyRepository.findOne({
      where: {
        id: historyId,
      },
    });

    if (history) {
      await historyRepository.remove(history);
      res.json({ success: true });
    } else {
      res.status(404).json({
        message: `History not found with id ${historyId}`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete history.",
      success: false,
      ...(error.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};
