import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './user.entity';

import {
    CreateUserDto,
    LoginUserDto,
    UpdateUserDto,
} from './dto/user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    // CREATE USER
    async createUser(createUserDto: CreateUserDto) {
        const { name, email, password } = createUserDto;

        const existingUser = await this.userRepository.findOne({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = this.userRepository.create({
            name,
            email,
            password: hashedPassword,
        });

        const savedUser = await this.userRepository.save(user);

        return this.removePassword(savedUser);
    }

    // LOGIN
    async login(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;

        const user = await this.userRepository.findOne({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException(
                'Invalid email or password',
            );
        }

        const passwordMatched = await bcrypt.compare(
            password,
            user.password,
        );

        if (!passwordMatched) {
            throw new UnauthorizedException(
                'Invalid email or password',
            );
        }

        return this.removePassword(user);
    }

    // GET ALL USERS / SEARCH
    async getUsers(search?: string) {
        const query = this.userRepository
            .createQueryBuilder('user');

        if (search) {
            query
                .where('user.name ILIKE :search', {
                    search: `%${search}%`,
                })
                .orWhere('user.email ILIKE :search', {
                    search: `%${search}%`,
                });
        }

        const users = await query.getMany();

        return users.map((user) =>
            this.removePassword(user),
        );
    }

    // GET USER BY ID
    async getUserById(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.removePassword(user);
    }

    // UPDATE USER
    async updateUser(
        id: number,
        updateUserDto: UpdateUserDto,
    ) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check duplicate email
        if (
            updateUserDto.email &&
            updateUserDto.email !== user.email
        ) {
            const existingUser =
                await this.userRepository.findOne({
                    where: {
                        email: updateUserDto.email,
                    },
                });

            if (existingUser) {
                throw new ConflictException(
                    'Email already exists',
                );
            }
        }

        // Hash new password
        if (updateUserDto.password) {
            updateUserDto.password =
                await bcrypt.hash(
                    updateUserDto.password,
                    12,
                );
        }

        Object.assign(user, updateUserDto);

        const updatedUser =
            await this.userRepository.save(user);

        return this.removePassword(updatedUser);
    }

    // DELETE USER
    async deleteUser(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.userRepository.remove(user);

        return {
            message: 'User deleted successfully',
        };
    }

    // REMOVE PASSWORD FROM RESPONSE
    private removePassword(user: User) {
        const { password, ...result } = user;

        return result;
    }
}