import { User } from "../../entities/User";
import { AppDataSource } from "../data-source";
import * as bcrypt from "bcryptjs";

export const seedUser = async () => {
  const userRepository = AppDataSource.getRepository(User);

  const isUserExist = await userRepository?.findOne({
    where: {
      email: "jenis@my_ai_bot.com",
    },
  });

  if (!isUserExist) {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync("password", salt);
    const dummyUser = userRepository.create({
      firstName: "Jenis",
      lastName: "gadhiya",
      email: "jenis@my_ai_bot.com",
      role: "admin",
      password,
      organization: "My AI bot org",
    });

    await userRepository.save(dummyUser);
  }
};
