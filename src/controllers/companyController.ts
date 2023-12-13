import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Company } from "../entities/company";

const companyRepository = AppDataSource.getRepository(Company);

export const getAllCompanies = async (
  req: Request & { userId: number },
  res: Response
) => {
  try {
    const { search, page, limit } = req.query;

    let query = companyRepository.createQueryBuilder("company");

    // Apply search filter
    if (search) {
      query = query.where("company.name LIKE :search", {
        search: `%${search}%`,
      });
    }

    query.andWhere("company.user_id = :userId", { userId: req?.userId });

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const [companies, total] = await query
      .skip(skip)
      .take(take)
      .orderBy("company.updatedAt", "DESC")
      .getManyAndCount();

    const paginationData = {
      page: pageNumber,
      pageSize,
      total,
    };

    res.json({ companies, paginationData, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch companies.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};

export const getCompanyById = async (
  req: Request & { userId: number },
  res: Response
) => {
  try {
    const { companyId } = req.params;
    const company = await companyRepository.findOne({
      where: { id: Number(companyId), user_id: req?.userId },
      relations: ["executed_prompts", "success_plan"],
    });
    if (company) {
      res.json({ company, success: true });
    } else {
      res.status(404).json({
        message: `Company not found with id ${companyId}.`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch company.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};
