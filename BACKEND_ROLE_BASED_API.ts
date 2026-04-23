/**
 * BACKEND IMPLEMENTATION GUIDE - Role-Based Access Control
 * NestJS + TypeORM
 * 
 * This file contains production-ready patterns for role-based API security
 */

// ============================================================================
// 1. ROLE ENUM & TYPES
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
    marketId?: string; // ADMIN, MANAGER, SELLER have marketId
}

// ============================================================================
// 2. REQUEST/CONTEXT DECORATOR
// ============================================================================

import { Injectable } from '@nestjs/common';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user; // From JWT token payload
    },
);

// ============================================================================
// 3. MARKET SCOPE BUILDER - CORE SECURITY PATTERN
// ============================================================================

@Injectable()
export class MarketScopeService {
    /**
     * Build WHERE clause based on user role and marketId
     * CRITICAL: This ensures data isolation per market
     */
    buildMarketFilter(user: AuthUser): { marketId?: string } {
        // SUPERADMIN sees all data - no filter
        if (user.role === UserRole.SUPERADMIN) {
            return {};
        }

        // All other roles filtered by their assigned market
        if (!user.marketId) {
            throw new UnauthorizedException(
                'User must be assigned to a market'
            );
        }

        // OWNER, ADMIN, MANAGER, SELLER all get marketId filter
        return { marketId: user.marketId };
    }

    /**
     * Check if user owns the resource
     * Used for update/delete operations
     */
    isResourceOwner(user: AuthUser, resourceMarketId: string): boolean {
        if (user.role === UserRole.SUPERADMIN) return true;
        return user.marketId === resourceMarketId;
    }
}

// ============================================================================
// 4. CONTROLLER EXAMPLES - CUSTOMERS ENDPOINT
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
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
    constructor(
        private customersService: CustomersService,
        private marketScopeService: MarketScopeService,
    ) { }

    /**
     * GET /customers?marketId=&search=
     * 
     * ROLE ACCESS:
     * - SUPERADMIN: all customers (optional filter by marketId)
     * - OWNER: all their market customers
     * - ADMIN: their market customers only
     * - MANAGER: their market customers only
     * - SELLER: forbidden
     */
    @Get()
    async getCustomers(
        @CurrentUser() user: AuthUser,
        @Query('search') search?: string,
        @Query('limit') limit: number = 50,
        @Query('page') page: number = 1,
    ) {
        // Role-based access control
        if (user.role === UserRole.SELLER) {
            throw new ForbiddenException('SELLER cannot access customers');
        }

        // Build market filter
        const marketFilter = this.marketScopeService.buildMarketFilter(user);

        // Fetch with pagination and search
        const [customers, total] = await this.customersService.findAndCount({
            where: {
                ...marketFilter,
                ...(search && { name: ILike(`%${search}%`) }),
            },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return {
            data: customers,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * POST /customers
     * Create customer in user's market
     */
    @Post()
    async createCustomer(
        @CurrentUser() user: AuthUser,
        @Body() createCustomerDto: CreateCustomerDto,
    ) {
        // SELLER cannot create customers
        if (user.role === UserRole.SELLER) {
            throw new ForbiddenException(
                'SELLER cannot create customers'
            );
        }

        // Customer always belongs to user's market
        const customer = await this.customersService.create({
            ...createCustomerDto,
            marketId: user.marketId,
            createdBy: user.id,
        });

        return { data: customer };
    }

    /**
     * PATCH /customers/:id
     * Update customer (must belong to user's market)
     */
    @Patch(':id')
    async updateCustomer(
        @CurrentUser() user: AuthUser,
        @Param('id') customerId: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ) {
        if (user.role === UserRole.SELLER) {
            throw new ForbiddenException(
                'SELLER cannot update customers'
            );
        }

        // Verify customer belongs to user's market
        const customer = await this.customersService.findById(customerId);

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        if (!this.marketScopeService.isResourceOwner(user, customer.marketId)) {
            throw new ForbiddenException(
                'Cannot update customer from another market'
            );
        }

        const updated = await this.customersService.update(
            customerId,
            updateCustomerDto,
        );

        return { data: updated };
    }

    /**
     * DELETE /customers/:id
     * Delete customer (must belong to user's market)
     */
    @Delete(':id')
    async deleteCustomer(
        @CurrentUser() user: AuthUser,
        @Param('id') customerId: string,
    ) {
        if (user.role === UserRole.SELLER) {
            throw new ForbiddenException(
                'SELLER cannot delete customers'
            );
        }

        const customer = await this.customersService.findById(customerId);

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        if (!this.marketScopeService.isResourceOwner(user, customer.marketId)) {
            throw new ForbiddenException(
                'Cannot delete customer from another market'
            );
        }

        await this.customersService.delete(customerId);

        return { success: true, message: 'Customer deleted' };
    }
}

// ============================================================================
// 5. SERVICE PATTERN - CUSTOMERS SERVICE
// ============================================================================

import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
    ) { }

    /**
     * Find and count customers
     * Service layer should NOT apply role filters - handled in controller
     * Service is data access only
     */
    async findAndCount(options: FindManyOptions<Customer>) {
        return this.customersRepository.findAndCount(options);
    }

    async findById(id: string) {
        return this.customersRepository.findOne({ where: { id } });
    }

    async create(data: CreateCustomerDto & { marketId: string; createdBy: string }) {
        const customer = this.customersRepository.create(data);
        return this.customersRepository.save(customer);
    }

    async update(id: string, data: UpdateCustomerDto) {
        await this.customersRepository.update(id, data);
        return this.findById(id);
    }

    async delete(id: string) {
        return this.customersRepository.delete(id);
    }
}

// ============================================================================
// 6. DASHBOARD ENDPOINT - ROLE-BASED STATS
// ============================================================================

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(
        private dashboardService: DashboardService,
        private marketScopeService: MarketScopeService,
    ) { }

    /**
     * GET /dashboard/summary?marketId=
     * 
     * ROLE ACCESS:
     * - SUPERADMIN: stats for all markets (or filtered by marketId param)
     * - OWNER: stats for their markets only
     * - ADMIN: stats for their assigned market only
     * - MANAGER: stats for their assigned market only
     * - SELLER: forbidden
     * 
     * SECURITY: Frontend sends ?marketId= but backend validates user access
     */
    @Get('summary')
    async getDashboardSummary(
        @CurrentUser() user: AuthUser,
        @Query('marketId') requestedMarketId?: string,
    ) {
        if (user.role === UserRole.SELLER) {
            throw new ForbiddenException('SELLER cannot access dashboard');
        }

        let targetMarketId = requestedMarketId;

        // SUPERADMIN can access any market
        if (user.role !== UserRole.SUPERADMIN) {
            // Non-SUPERADMIN can only access their assigned market
            targetMarketId = user.marketId;
        }

        if (!targetMarketId) {
            throw new BadRequestException('marketId is required');
        }

        // Get dashboard data
        const summary = await this.dashboardService.getSummary(targetMarketId);

        return {
            data: {
                marketId: targetMarketId,
                totalCustomers: summary.customers,
                activeContracts: summary.contracts,
                totalRevenue: summary.revenue,
                pendingPayments: summary.pendingPayments,
                overduePayments: summary.overduePayments,
            },
        };
    }
}

// ============================================================================
// 7. USERS ENDPOINT - ADMIN/OWNER MANAGEMENT
// ============================================================================

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private usersService: UsersService,
        private marketScopeService: MarketScopeService,
    ) { }

    /**
     * GET /users
     * 
     * ROLE ACCESS:
     * - SUPERADMIN: all users in all markets
     * - OWNER: users in their markets only
     * - ADMIN: cannot list users (assigned to one market only)
     * - MANAGER: forbidden
     * - SELLER: forbidden
     */
    @Get()
    async getUsers(
        @CurrentUser() user: AuthUser,
        @Query('marketId') marketId?: string,
    ) {
        // Only SUPERADMIN and OWNER can list users
        if (![UserRole.SUPERADMIN, UserRole.OWNER].includes(user.role)) {
            throw new ForbiddenException('User cannot access user management');
        }

        const whereFilter: any = {};

        if (user.role === UserRole.OWNER) {
            // OWNER sees users in their markets
            whereFilter.marketId = user.marketId;
        }

        if (marketId && user.role === UserRole.SUPERADMIN) {
            // SUPERADMIN can filter by marketId
            whereFilter.marketId = marketId;
        }

        const users = await this.usersService.findAll(whereFilter);

        return {
            data: users,
            total: users.length,
        };
    }

    /**
     * POST /users
     * Create user (assign to market)
     */
    @Post()
    async createUser(
        @CurrentUser() user: AuthUser,
        @Body() createUserDto: CreateUserDto,
    ) {
        if (user.role !== UserRole.OWNER && user.role !== UserRole.SUPERADMIN) {
            throw new ForbiddenException('Only OWNER can create users');
        }

        // Determine target market
        let targetMarketId = createUserDto.marketId;

        if (user.role === UserRole.OWNER) {
            // OWNER can only create users in their market
            targetMarketId = user.marketId;
        }

        const newUser = await this.usersService.create({
            ...createUserDto,
            marketId: targetMarketId,
        });

        return { data: newUser };
    }

    /**
     * PATCH /users/:id
     * Update user
     */
    @Patch(':id')
    async updateUser(
        @CurrentUser() user: AuthUser,
        @Param('id') userId: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        if (user.role !== UserRole.OWNER && user.role !== UserRole.SUPERADMIN) {
            throw new ForbiddenException('Only OWNER can update users');
        }

        const targetUser = await this.usersService.findById(userId);

        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        // OWNER can only update users in their market
        if (
            user.role === UserRole.OWNER &&
            targetUser.marketId !== user.marketId
        ) {
            throw new ForbiddenException(
                'Cannot update user from another market'
            );
        }

        const updated = await this.usersService.update(userId, updateUserDto);

        return { data: updated };
    }
}

// ============================================================================
// 8. ROLE ACCESS PERMISSION MATRIX
// ============================================================================

export const ROLE_PERMISSIONS = {
    [UserRole.SUPERADMIN]: {
        // Superadmin has unrestricted access
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
        // Owner manages their markets and all their data
        users: ['read', 'create', 'update', 'delete'], // Their market users
        customers: ['read', 'create', 'update', 'delete'], // Their market customers
        contracts: ['read', 'create', 'update', 'delete'], // Their market contracts
        products: ['read', 'create', 'update', 'delete'], // Their market products
        categories: ['read', 'create', 'update', 'delete'], // Their market categories
        dashboard: ['read'],
        markets: ['read', 'create', 'update', 'delete'],
        subscriptions: ['read'],
    },

    [UserRole.ADMIN]: {
        // Admin manages one assigned market
        users: [], // Cannot manage users
        customers: ['read', 'create', 'update', 'delete'],
        contracts: ['read', 'create', 'update', 'delete'],
        products: ['read', 'create', 'update', 'delete'],
        categories: ['read', 'create', 'update', 'delete'],
        dashboard: ['read'],
        markets: [], // Cannot create/edit markets
        subscriptions: [],
    },

    [UserRole.MANAGER]: {
        // Manager handles customer and contract management
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
        // Seller manages products and categories only
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

// ============================================================================
// 9. GENERAL PATTERNS TO IMPLEMENT
// ============================================================================

/*

FOR EVERY ENDPOINT:

1. Check user role has permission for operation
   if (!ROLE_PERMISSIONS[user.role][resource].includes(action)) {
       throw new ForbiddenException();
   }

2. Build market filter if not SUPERADMIN
   const marketFilter = this.marketScopeService.buildMarketFilter(user);

3. Apply filter to database query
   findAndCount({ where: { ...marketFilter, ...otherFilters } })

4. For UPDATE/DELETE operations, verify resource ownership
   if (!this.marketScopeService.isResourceOwner(user, resource.marketId)) {
       throw new ForbiddenException();
   }

5. Return only safe data (never include internal IDs/tokens)
   return { data: sanitizedData };

ENDPOINTS TO IMPLEMENT:

GET /users - List users (OWNER, SUPERADMIN only)
POST /users - Create user (OWNER, SUPERADMIN)
PATCH /users/:id - Update user (OWNER, SUPERADMIN)
DELETE /users/:id - Delete user (OWNER, SUPERADMIN)

GET /customers - List customers (all except SELLER)
POST /customers - Create customer
PATCH /customers/:id - Update customer
DELETE /customers/:id - Delete customer

GET /contracts - List contracts (all except SELLER)
POST /contracts - Create contract
PATCH /contracts/:id - Update contract
DELETE /contracts/:id - Delete contract

GET /products - List products (OWNER, ADMIN, MANAGER, SELLER)
POST /products - Create product
PATCH /products/:id - Update product
DELETE /products/:id - Delete product

GET /categories - List categories (OWNER, ADMIN, MANAGER, SELLER)
POST /categories - Create category
PATCH /categories/:id - Update category
DELETE /categories/:id - Delete category

GET /dashboard/summary - Dashboard stats (all except SELLER)

GET /subscriptions/plans - Public subscriptions (no role check)

*/
