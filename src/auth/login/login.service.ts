import { ForbiddenException, Injectable } from '@nestjs/common';
import { LoginDto } from 'src/common/dtos';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Tokens } from 'src/common/types';
import * as argon from 'argon2';
import { GenerateJwtService } from '../jwt/generate.jwt.service';

@Injectable()
export class LoginService {
    constructor(
        private prismaService: PrismaService,
        private generateJwtService: GenerateJwtService,
        ) {}

    async login(dto: LoginDto): Promise<Tokens> {
        const user = this.prismaService.user.findUnique({
            where: {
                email: dto.email
            }
        })
        if (!user) throw new ForbiddenException('Invalid email or password');

        const passwordMatches = await argon.verify((await user).password, dto.password);
        if (!passwordMatches) throw new ForbiddenException('Invalid email or password');

        const tokens = await this.generateJwtService.getToken((await user).id, (await user).email, (await user).roleName);
        await this.updateRtHash((await user).id, tokens.refresh_token);
        return tokens;
    }

    async updateRtHash(userId: string, rtHash: string) {
        const hash = await argon.hash(rtHash);
        await this.prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                hashedRt: hash
            }
        })
    }
}
