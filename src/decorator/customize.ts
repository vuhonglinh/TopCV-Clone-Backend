// Decorator Public trong đoạn mã của bạn có tác dụng đánh dấu các route (đường dẫn) cụ thể là công khai (public),
//  nghĩa là không yêu cầu xác thực (authentication). Khi bạn sử dụng decorator này trên một route, cơ chế bảo vệ mặc định (ở đây là JwtAuthGuard) sẽ bỏ qua xác thực cho route đó,
//   cho phép mọi người truy cập mà không cần token JWT.
import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const RESPONSE_MESSAGE = 'response_message';
export const ResponseMessage = (message: string) => {
  return SetMetadata(RESPONSE_MESSAGE, message)
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const IS_PUBLIC_PERMISSION = 'isPublicPermission';
export const ShipCheckPermission = () => SetMetadata(IS_PUBLIC_PERMISSION, true);























