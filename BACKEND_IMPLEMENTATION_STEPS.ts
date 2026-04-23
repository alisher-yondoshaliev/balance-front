/**
 * STEP-BY-STEP IMPLEMENTATION GUIDE
 * How to implement role-based access control in your NestJS backend
 * 
 * This guide provides exact code you can copy-paste and adapt
 */

// ============================================================================
// STEP 1: CREATE ENUMS & TYPES (src/common/types/auth.types.ts)
// ============================================================================

export enum UserRole {
    SUPERADMIN = 'SUPERADMIN',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    SELLER = 'SELLER',
}

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    marketId?: string;
}

export interface JwtPayload {
    sub: string; // user id
    email: string;
    role: UserRole;
    marketId?: string;
    iat: number;
    exp: number;
}

// ============================================================================
// STEP 2: IMPLEMENT MARKET SCOPE SERVICE
// (src/common/services/market-scope.service.ts)
// ============================================================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthUser, UserRole } from '../types/auth.types';

@Injectable()
export class MarketScopeService {
    /**
     * Build WHERE clause based on user role
     * Returns object to spread into TypeORM where clause
     */
    buildMarketFilter(user: AuthUser): Record<string, any> {
        // SUPERADMIN sees all - no filter
        if (user.role === UserRole.SUPERADMIN) {
            return {};
        }

        // All other roles: must have marketId assigned
        if (!user.marketId) {
            throw new UnauthorizedException(
                `User with role ${user.role} must have marketId assigned`,
            );
        }

        // OWNER, ADMIN, MANAGER, SELLER all get marketId filter
        return { marketId: user.marketId };
    }

    /**
     * Check if user owns/can access resource in their market
     */
    isResourceOwner(user: AuthUser, resourceMarketId: string): boolean {
        // SUPERADMIN can access anything
        if (user.role === UserRole.SUPERADMIN) {
            return true;
        }

        // Check market isolation
        return user.marketId === resourceMarketId;
    }

    /**
     * Check if user can access specific market
     */
    canAccessMarket(user: AuthUser, requestedMarketId: string): boolean {
        if (user.role === UserRole.SUPERADMIN) {
            return true;
        }

        return user.marketId === requestedMarketId;
    }
}

// ============================================================================
// STEP 3: CREATE CURRENT USER DECORATOR
// (src/common/decorators/current-user.decorator.ts)
// ============================================================================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../types/auth.types';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): AuthUser => {
        const request = ctx.switchToHttp().getRequest();
        return request.user; // Attached by JwtAuthGuard
    },
);

// ============================================================================
// STEP 4: JWT GUARD (src/auth/guards/jwt.guard.ts)
// ============================================================================

import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../types/auth.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private jwtService: JwtService) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('No authorization header');
        }

        const [scheme, token] = authHeader.split(' ');

        if (scheme !== 'Bearer') {
            throw new UnauthorizedException('Invalid authorization scheme');
        }

        try {
            const payload = this.jwtService.verify<JwtPayload>(token);
            request.user = {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
                marketId: payload.marketId,
            };
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

// ============================================================================
// STEP 5: AUTH SERVICE - TOKEN GENERATION
// (src/auth/auth.service.ts)
// ============================================================================

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUser, JwtPayload, UserRole } from '../common/types/auth.types';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    /**
     * Generate JWT token
     * accessToken: 15 minutes expiration
     */
    generateAccessToken(user: AuthUser): string {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            marketId: user.marketId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
        };

        return this.jwtService.sign(payload);
    }

    /**
     * Generate refresh token
     * refreshToken: 7 days expiration (only to refresh access token)
     */
    generateRefreshToken(user: AuthUser): string {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            marketId: user.marketId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        };

        return this.jwtService.sign(payload);
    }

    /**
     * Generate both tokens
     */
    generateTokens(user: AuthUser): { accessToken: string; refreshToken: string } {
        return {
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user),
        };
    }

    /**
     * Verify and refresh token
     */
    refreshToken(refreshToken: string): AuthUser {
        try {
            const payload = this.jwtService.verify<JwtPayload>(refreshToken);
            return {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
                marketId: payload.marketId,
            };
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}

// ============================================================================
// STEP 6: ROLE PERMISSIONS MATRIX
// (src/common/constants/permissions.ts)
// ============================================================================

import { UserRole } from '../types/auth.types';

export type ResourceAction = 'read' | 'create' | 'update' | 'delete';

export type ResourceType =
    | 'users'
    | 'customers'
    | 'contracts'
    | 'products'
    | 'categories'
    | 'dashboard'
    | 'markets'
    | 'subscriptions';

export const ROLE_PERMISSIONS: Record<
    UserRole,
    Record<ResourceType, ResourceAction[]>
> = {
    [UserRole.SUPERADMIN]: {
        users: ['read', 'create', 'update', 'delete'],
        customers: ['read', 'create', 'update', 'delete'],
        contracts: ['read', 'create', 'update', 'delete'],
        products: ['read', 'create', 'update', 'delete'],
        categories: ['read', 'create', 'update', 'delete'],
        dashboard: ['read'],
        markets: ['read', 'create', 'update', 'delete'],
        subscriptions: ['read', 'create', 'update', 'delete'],
    },

    [UserRole.OWNER]: {
        users: ['read', 'create', 'update', 'delete'],
        customers: ['read', 'create', 'update', 'delete'],
        contracts: ['read', 'create', 'update', 'delete'],
        products: ['read', 'create', 'update', 'delete'],
        categories: ['read', 'create', 'update', 'delete'],
        dashboard: ['read'],
        markets: ['read', 'create', 'update', 'delete'],
        subscriptions: ['read'],
    },

    [UserRole.ADMIN]: {
        users: [],
        customers: ['read', 'create', 'update', 'delete'],
        contracts: ['read', 'create', 'update', 'delete'],
        products: ['read', 'create', 'update', 'delete'],
        categories: ['read', 'create', 'update', 'delete'],
        dashboard: ['read'],
        markets: [],
        subscriptions: [],
    },

    [UserRole.MANAGER]: {
        users: [],
        customers: ['read', 'create', 'update', 'delete'],
        contracts: ['read', 'create', 'update', 'delete'],
        products: [],
        categories: [],
        dashboard: ['read'],
        markets: [],
        subscriptions: [],
    },

    [UserRole.SELLER]: {
        users: [],
        customers: [],
        contracts: [],
        products: ['read', 'create', 'update'],
        categories: ['read', 'create', 'update'],
        dashboard: [],
        markets: [],
        subscriptions: [],
    },
};

/**
 * Verify user has permission
 */
export function checkPermission(
    role: UserRole,
    resource: ResourceType,
    action: ResourceAction,
): boolean {
    return ROLE_PERMISSIONS[role][resource].includes(action);
}

// ============================================================================
// STEP 7: ROLE CHECK DECORATOR
// (src/common/decorators/check-role.decorator.ts)
// ============================================================================

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types/auth.types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) =>
    SetMetadata(ROLES_KEY, roles);

// ============================================================================
// STEP 8: ROLE CHECK GUARD
// (src/common/guards/role.guard.ts)
// ============================================================================

import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/check-role.decorator';
import { UserRole } from '../types/auth.types';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles) {
            return true; // No role requirement
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                `This action requires one of these roles: ${requiredRoles.join(', ')}`,
            );
        }

        return true;
    }
}

// ============================================================================
// STEP 9: EXAMPLE CONTROLLER - CUSTOMERS
// (src/customers/customers.controller.ts)
// ============================================================================

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/check-role.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MarketScopeService } from '../common/services/market-scope.service';
import {
    checkPermission,
    type ResourceType,
} from '../common/constants/permissions';
import { AuthUser, UserRole } from '../common/types/auth.types';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';

const RESOURCE: ResourceType = 'customers';

@Controller('customers')
@UseGuards(JwtAuthGuard, RoleGuard)
export class CustomersController {
    constructor(
        private customersService: CustomersService,
        private marketScopeService: MarketScopeService,
    ) { }

    /**
     * GET /customers?marketId=&search=&page=&limit=
     * 
     * Allowed roles: SUPERADMIN, OWNER, ADMIN, MANAGER
     * Denied: SELLER
     */
    @Get()
    async getAll(
        @CurrentUser() user: AuthUser,
        @Query('marketId') marketId?: string,
        @Query('search') search?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 50,
    ) {
        // 1. Check permission
        if (!checkPermission(user.role, RESOURCE, 'read')) {
            throw new ForbiddenException(
                `Role ${user.role} cannot read customers`,
            );
        }

        // 2. Build market filter
        const marketFilter = this.marketScopeService.buildMarketFilter(user);

        // 3. Build where clause
        const where: any = { ...marketFilter };
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        // 4. Fetch with pagination
        const [customers, total] = await this.customersService.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return {
            data: customers,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        };
    }

    /**
     * GET /customers/:id
     */
    @Get(':id')
    async getById(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        // 1. Check permission
        if (!checkPermission(user.role, RESOURCE, 'read')) {
            throw new ForbiddenException(
                `Role ${user.role} cannot read customers`,
            );
        }

        // 2. Find customer
        const customer = await this.customersService.findById(id);
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        // 3. Verify ownership
        if (!this.marketScopeService.isResourceOwner(user, customer.marketId)) {
            throw new ForbiddenException(
                'Cannot access customer from another market',
            );
        }

        return { data: customer };
    }

    /**
     * POST /customers
     * Create customer in user's market
     */
    @Post()
    async create(
        @CurrentUser() user: AuthUser,
        @Body() createDto: CreateCustomerDto,
    ) {
        // 1. Check permission
        if (!checkPermission(user.role, RESOURCE, 'create')) {
            throw new ForbiddenException(
                `Role ${user.role} cannot create customers`,
            );
        }

        // 2. Customer always belongs to user's market
        const customer = await this.customersService.create({
            ...createDto,
            marketId: user.marketId,
            createdBy: user.id,
        });

        return { data: customer };
    }

    /**
     * PATCH /customers/:id
     * Update customer
     */
    @Patch(':id')
    async update(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() updateDto: UpdateCustomerDto,
    ) {
        // 1. Check permission
        if (!checkPermission(user.role, RESOURCE, 'update')) {
            throw new ForbiddenException(
                `Role ${user.role} cannot update customers`,
            );
        }

        // 2. Find customer
        const customer = await this.customersService.findById(id);
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        // 3. Verify ownership
        if (!this.marketScopeService.isResourceOwner(user, customer.marketId)) {
            throw new ForbiddenException(
                'Cannot update customer from another market',
            );
        }

        // 4. Update
        const updated = await this.customersService.update(id, updateDto);

        return { data: updated };
    }

    /**
     * DELETE /customers/:id
     */
    @Delete(':id')
    async delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        // 1. Check permission
        if (!checkPermission(user.role, RESOURCE, 'delete')) {
            throw new ForbiddenException(
                `Role ${user.role} cannot delete customers`,
            );
        }

        // 2. Find customer
        const customer = await this.customersService.findById(id);
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        // 3. Verify ownership
        if (!this.marketScopeService.isResourceOwner(user, customer.marketId)) {
            throw new ForbiddenException(
                'Cannot delete customer from another market',
            );
        }

        // 4. Delete
        await this.customersService.delete(id);

        return { success: true, message: 'Customer deleted' };
    }
}

// ============================================================================
// STEP 10: APPLY TO OTHER CONTROLLERS
// ============================================================================

/*
Follow the same pattern for:
- ContractsController
- ProductsController
- CategoriesController
- UsersController
- DashboardController

Key differences per role:
- ADMIN: Cannot manage users
- MANAGER: Can only manage customers/contracts
- SELLER: Can only manage products/categories
- OWNER: Can manage everything in their market
- SUPERADMIN: Can manage everything globally

*/

// ============================================================================
// QUICK REFERENCE - COPY THIS TEMPLATE FOR EACH ENDPOINT
// ============================================================================

/*

@Get()
async getAll(
    @CurrentUser() user: AuthUser,
    @Query() queryParams,
) {
    // 1. Check permission
    if (!checkPermission(user.role, RESOURCE, 'read')) {
        throw new ForbiddenException(`Cannot read ${RESOURCE}`);
    }

    // 2. Build market filter
    const marketFilter = this.marketScopeService.buildMarketFilter(user);

    // 3. Query database
    const items = await this.service.findAll({
        where: { ...marketFilter, ...otherFilters },
        skip: queryParams.skip,
        take: queryParams.take,
    });

    // 4. Return
    return { data: items };
}

@Post()
async create(
    @CurrentUser() user: AuthUser,
    @Body() createDto,
) {
    // 1. Check permission
    if (!checkPermission(user.role, RESOURCE, 'create')) {
        throw new ForbiddenException(`Cannot create ${RESOURCE}`);
    }

    // 2. Add market context
    const item = await this.service.create({
        ...createDto,
        marketId: user.marketId,
    });

    // 3. Return
    return { data: item };
}

@Patch(':id')
async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id,
    @Body() updateDto,
) {
    // 1. Check permission
    if (!checkPermission(user.role, RESOURCE, 'update')) {
        throw new ForbiddenException(`Cannot update ${RESOURCE}`);
    }

    // 2. Verify ownership
    const item = await this.service.findById(id);
    if (!this.marketScopeService.isResourceOwner(user, item.marketId)) {
        throw new ForbiddenException(`Cannot update ${RESOURCE} from another market`);
    }

    // 3. Update
    const updated = await this.service.update(id, updateDto);

    // 4. Return
    return { data: updated };
}

@Delete(':id')
async delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id,
) {
    // 1. Check permission
    if (!checkPermission(user.role, RESOURCE, 'delete')) {
        throw new ForbiddenException(`Cannot delete ${RESOURCE}`);
    }

    // 2. Verify ownership
    const item = await this.service.findById(id);
    if (!this.marketScopeService.isResourceOwner(user, item.marketId)) {
        throw new ForbiddenException(`Cannot delete ${RESOURCE} from another market`);
    }

    // 3. Delete
    await this.service.delete(id);

    // 4. Return
    return { success: true };
}

*/
