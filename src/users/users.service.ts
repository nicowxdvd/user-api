import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY_TOKEN, type IUserRepository, type UsersCursor } from './interface/user-repository.interface';

const LIMITE_POR_DEFECTO = 20;
const LIMITE_MAXIMO      = 100;

@Injectable()
export class UsersService {

  constructor(@Inject(USER_REPOSITORY_TOKEN) private userRepository: IUserRepository) {}


  async create(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;
    const existingUser                             = await this.userRepository.findByEmail(email);

    if (existingUser) 
      throw new ConflictException('El correo ya esta registrado.');

    const hashedPassword  = await bcrypt.hash(password, 10);
    const user            = await this.userRepository.save({ email, password: hashedPassword, firstName, lastName });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;

  }



  async findMe(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) 
      throw new NotFoundException('El usuario del token ya no existe');

    return user;

  }


  findAll(roleActive?: boolean, cursorToken?: string, limit?: number) {
    const take = limit ?? LIMITE_POR_DEFECTO;
    if (take < 1 || take > LIMITE_MAXIMO)
      throw new BadRequestException(`El límite debe ser un número entre 1 y ${LIMITE_MAXIMO}`);

    return this.userRepository.findAll(roleActive, this.decodeCursor(cursorToken), take);

  }


  private decodeCursor(cursorToken?: string): UsersCursor | undefined {
    if (!cursorToken) return undefined;

    const [createdAt, id] = Buffer.from(cursorToken, 'base64').toString('utf8').split('|');
    if (!createdAt || !id || Number.isNaN(Date.parse(createdAt)))
      throw new BadRequestException('El cursor de paginación no es válido');

    return { createdAt: new Date(createdAt), id };

  }


  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user)
      throw new NotFoundException(`El usuario con ID ${id} no existe`);

    return user;

  }


  async update(id: string, updateUserDto: UpdateUserDto) {
    if (Object.keys(updateUserDto).length === 0)
      throw new BadRequestException('Debe enviar al menos un campo para actualizar');

    const user = await this.userRepository.update(id, updateUserDto);
    if (!user) throw new NotFoundException(`El usuario con ID ${id} no existe`);

    return user;

  }


  async toggleStatus(id: string): Promise<{ message: string; isActive: boolean }> {
    const user = await this.userRepository.findById(id);

    if (!user)
      throw new NotFoundException(`El usuario con ID ${id} no existe`);

    const newStatus = !user.isActive;
    await this.userRepository.updateStatus(id, newStatus);

    return { message: `El usuario ahora está ${newStatus ? 'activo' : 'inactivo'}`, isActive: newStatus };

  }


  async remove(id: string): Promise<{ message: string }> {
    const result = await this.userRepository.delete(id);
    if (!result.affected) 
      throw new NotFoundException(`El usuario con ID ${id} no existe`);

    return { message: `Usuario con ID ${id} eliminado exitosamente` };

  }

}
