
import {api} from "@/api/axios";

interface SignUpRequest {
    name: string;
    email: string;
    password: string;
}

interface SignInRequest {
    username: string;
    password: string;
}

interface JwtResponse {
    token: string;
}

export const signUp = async (data: SignUpRequest): Promise<string> => {
    const res = await api.post("/auth/signUp", data);
    return res.data;
};

export const signIn = async (data: SignInRequest): Promise<JwtResponse> => {
    const res = await api.post("/auth/signIn", data);
    const token = res.data.token;
    localStorage.setItem("token", token);
    return res.data;
};

