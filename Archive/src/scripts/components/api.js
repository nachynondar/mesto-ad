const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "bf62307e-969a-4a9b-8aab-543b9848f865",
    "Content-Type": "application/json",
  },
};

export const getResponseData = (res) => {
  return res
    .json()
    .then((data) => {
      if (res.ok) {
        return data;
      }
      return Promise.reject(
        `Ошибка ${res.status}: ${data.message || JSON.stringify(data)}`
      );
    })
    .catch((error) => {
      if (error instanceof SyntaxError) {
        if (res.ok) {
          return {};
        }
        return Promise.reject(`Ошибка ${res.status}`);
      }
      return Promise.reject(error);
    });
};

const request = (endpoint, options = {}) => {
  return fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...config.headers,
      ...options.headers,
    },
  }).then(getResponseData);
};

export const getUserInfo = () => {
  return request("/users/me", { method: "GET" });
};

export const getCardList = () => {
  return request("/cards", { method: "GET" });
};

export const patchUserInfo = ({ name, about }) => {
  return request("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });
};

export const postCard = ({ name, link }) => {
  return request("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });
};

export const deleteCardApi = (cardId) => {
  return request(`/cards/${cardId}`, { method: "DELETE" });
};

export const putLike = (cardId) => {
  return request(`/cards/${cardId}/likes`, { method: "PUT" });
};

export const deleteLike = (cardId) => {
  return request(`/cards/${cardId}/likes`, { method: "DELETE" });
};

export const patchAvatar = ({ avatar }) => {
  return request("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });
};
