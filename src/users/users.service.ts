/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import {
  USER_REPOSITORY_TOKEN,
  type IUserRepository,
} from './interface/user-repository.interface';
const ROL_POR_DEFECTO_ID = 11;

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private userRepository: IUserRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El correo ya esta registrado.');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.userRepository.save({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roleId: ROL_POR_DEFECTO_ID,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
      throw error;
    }
  }

  /**
   * Devuelve el usuario dueño del token. El id sale del payload, nunca del
   * cliente, así que no hay forma de pedir la ficha de otra persona.
   */
  async findMe(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('El usuario del token ya no existe');
    }

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  findAll(roleActive?: boolean) {
    return this.userRepository.findAll(roleActive);
  }

  findOne(id: string) {
    return this.userRepository.findById(id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
