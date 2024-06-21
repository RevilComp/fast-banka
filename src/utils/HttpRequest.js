import axios from "axios";

class HttpRequest {
  #url;

  constructor(backend) {
    if (backend === "api") {
      // ! Don't touch
      this.#url = process.env.REACT_APP_API_URL;
    }
  }

  async get(endpoint, payload) {
    try {
      // console.log(`${this.#url}/${endpoint} in GET REQUEST.`);

      const response = await axios.get(`${this.#url}/${endpoint}`, {
        params: {
          ...payload,
        },
      });

      // console.log(response.data);
      return response.data;
    } catch (e) {
      // console.log(e.response.data);
      return e.response.data;
    }
  }

  async post(endpoint, payload) {
    try {
      // console.log(`${this.#url}/${endpoint} in POST REQUEST.`);

      const response = await axios.post(`${this.#url}/${endpoint}`, {
        ...payload,
      });

      // console.log(response.data);
      return response.data;
    } catch (e) {
      // console.log(e.response.data);
      return e.response.data;
    }
  }
}

export default HttpRequest;
