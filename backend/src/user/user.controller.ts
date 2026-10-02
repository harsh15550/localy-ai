import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    // LOGIN
    @Post('login')
    async login(
        @Body() loginUserDto: LoginUserDto,
    ) {
        return this.userService.login(
            loginUserDto,
        );
    }

    // SEARCH / GET ALL
    @Get()
    async getUsers(
        @Query('search') search?: string,
    ) {
        return this.userService.getUsers(search);
    }

    // GET BY ID
    @Get(':id')
    async getUserById(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.userService.getUserById(id);
    }

    // UPDATE
    @Patch(':id')
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.userService.updateUser(
            id,
            updateUserDto,
        );
    }

    // DELETE
    @Delete(':id')
    async deleteUser(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.userService.deleteUser(id);
    }
}
