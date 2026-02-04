
import {api} from "@/api/axios";

export type Gender = "MALE" | "FEMALE" | "ALL";

interface UserInfoRequest {
    name: string;
    email: string;
    password: string;
    gender: Gender;
}

interface AuthRequest {
    username: string;
    password: string;
}

interface JwtResponse {
    accessToken: string;
    refreshToken: string;
}

interface Role {
    id: number;
    code: string;
    name: string;
    description: string;
}

interface UserInfoResponseRaw {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface UserInfoResponse {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

interface UserUpdateRequest {
    name: string;
    password?: string;
}

interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// 1. Sign Up - Create new user account
export const signUp = async (data: UserInfoRequest): Promise<void> => {
    await api.post("/auth/signUp", data);
};

// 2. Sign In - Authenticate user and get tokens
export const signIn = async (data: AuthRequest): Promise<JwtResponse> => {
    const res = await api.post("/auth/signIn", data);
    return res.data;
};

// 3. Refresh Access Token - Get new access token using refresh token
export const refreshAccessToken = async (refreshToken: string): Promise<JwtResponse> => {
    const res = await api.post("/auth/refresh", { refreshToken });
    return res.data;
};

// 4. Logout - Invalidate refresh token
export const logout = async (refreshToken: string): Promise<string> => {
    const res = await api.post("/auth/logout", { refreshToken });
    return res.data;
};

// 5. Get All Users - Paginated list (ADMIN only)
export const getAllUsers = async (page: number = 0, size: number = 10): Promise<PageResponse<UserInfoResponse>> => {
    const res = await api.get("/auth/users", {
        params: { page, size }
    });
    return res.data;
};

// 6. Get User By ID - Fetch single user details
export const getUserById = async (id: number): Promise<UserInfoResponse> => {
    const res = await api.get<UserInfoResponseRaw>(`/auth/users/${id}`);
    const data = res.data;
    
    // Transform roles from objects to string array
    return {
        ...data,
        roles: data.roles?.map(role => role.code) || []
    };
};

// 7. Delete User - Remove user account (ADMIN only)
export const deleteUser = async (id: number): Promise<string> => {
    const res = await api.delete(`/auth/users/${id}`);
    return res.data;
};

// 8. Update User - Update user profile (USER only)
export const updateUser = async (id: number, data: UserUpdateRequest): Promise<string> => {
    const res = await api.put(`/auth/users/${id}`, data);
    return res.data;
};

