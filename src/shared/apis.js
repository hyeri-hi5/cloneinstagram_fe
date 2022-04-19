import axios from "axios";
import { history } from "../redux/configureStore";

const api = axios.create({
  baseURL: "http://hyeonjun.shop/",
  headers: {
    "content-type": "application/json;charset=UTF-8",
    accept: "application/json,",
  },
});

// request interceptors
api.interceptors.request.use(function (config) {
  const atoken = localStorage.getItem("access_token");
  const rtoken = localStorage.getItem("refresh_token");

  config.headers.common["Authorization"] = `Bearer ${atoken}`;
  config.headers.common["rAuthorization"] = `Bearer ${rtoken}`;

  return config;
});

// response intercepters
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const {
      config,
      response: { status },
      response,
    } = error;
    const originalRequest = config;

    // 401 에러 발생시 토큰 만료되었을 때,
    if (status === 401) {
      if (response.data.accessToken) {
        // access token이 재발급 된 상태,
        console.log(response);
        localStorage.setItem("access_token", response.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axios(originalRequest);
      }
      if (response.data.reason === "refreshtoken expired") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        history.replace("/");
      }
    }
  }
);

export const apis = {
  // post
  add: (content) => api.post("/feed", content),
  edit: (id, contents) => api.patch(`feed/${id}`, contents),
  delete: (Id) => api.delete(`/feed/${Id}`),
  getDetail: (Id) => api.get(`/feed/${Id}`),

  // comment
  addComment: (post_id, NewComment) =>
    api.post("/comment", { postId: post_id, comment: NewComment }),
  delComment: (commentId) => api.delete(`/comment/${commentId}`),
  editComment: (commentId, comment) =>
    api.patch(`/comment/${commentId}`, { comment }),

  // user
  login: (payload) => api.post("/api/user/login", payload),
  join: (payload) => api.post("/api/user/join", payload),
  // userinfo: () => api.get(`/userinfo`),
};
