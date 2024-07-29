import { AuthService } from 'src/auth/auth.service';
import { Body, Controller, Get, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { RegisterUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rolesService: RolesService
  ) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @ApiBody({ type: UserLoginDto, })
  @Post('/login')
  @ResponseMessage("User Login")
  handleLogin(
    @Req() req,
    @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }




  @UseGuards(JwtAuthGuard)//Check đã đăng nhập chưa
  @Get('account')
  @ResponseMessage("Lấy thông tin thành công")
  async getProfile(@User() user: IUser) {
    const temp = await this.rolesService.findOne(user.role._id) as any
    user.permissions = temp.permissions
    return { user };
  }

  @Public()
  @Get('refresh')
  @ResponseMessage("Refresh Token thành công")
  handleRefreshToken(
    @Request() request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies["refresh_token"]
    return this.authService.processNewToken(refreshToken, response)
  }

  @Public()
  @Post('register')
  @ResponseMessage("Đăng ký tài khoản thành công")
  register(
    @Body() body: RegisterUserDto
  ) {
    return this.authService.register(body)
  }


  @Post('logout')
  @ResponseMessage("Đăng xuất tài khoản thành công")
  logout(
    @User() user: IUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(user, response)
  }

}
