import axios from "axios";
import {clearToken, getToken} from "@/lib/auth";

function AxiosInterceptor() {

    axios.interceptors.request.use(
        async (config) => {
            const token = await getToken();

            console.log("Axios Interceptor - Request Config:", token)
            if (token) {
                config.headers["Authorization"] = "Bearer " + token.value;
            }
            return config;
        },
        (error) => {
            Promise.reject(error);
        }
    );

    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        async function (error) {
            if (error?.response?.status === 401) {
                await clearToken();
                if (window.location.pathname !== "/") {
                    window.location.replace("/");
                }
                return Promise.reject(error);
            }
            else if(error?.response?.status === 503){
                await clearToken();
                window.location.replace("/maintenance");
            }
            return Promise.reject(error);
        }
    );
}

export default AxiosInterceptor;