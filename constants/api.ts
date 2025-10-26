import axios from "axios";
import {
  CREATE_EVENT,
  FORGOT_PASSWORD,
  GET_ALL_EVENTS,
  GET_ALL_TRANSACTIONS,
  GET_EVENT,
  GET_EVENTS,
  GET_ME,
  GET_ORGANIZED_EVENTS,
  GET_USER,
  GET_USER_EVENTS,
  UPDATE_PROFILE_IMAGE,
  USER_LOGIN,
  USER_REGISTER,
  VERIFY_OTP,
} from "./endpoints";
import api from "./axios";

export const userLoginFn = async (payload: UserLoginPayload) => {
  try {
    const response = await api.post(USER_LOGIN, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const userRegisterFn = async (payload: UserRegisterPayload) => {
  try {
    const response = await api.post(USER_REGISTER, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const getMeFn = async () => {
  try {
    const response = await api.get(GET_ME);
    console.log(response.data)
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const forgotPasswordFn = async (payload: { email: string }) => {
  try {
    const response = await api.post(FORGOT_PASSWORD, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const verifyOtpFn = async (payload: { email: string; otp: string }) => {
  try {
    const response = await api.post(VERIFY_OTP, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const createEventFn = async (payload: FormData) => {
  try {
    const response = await api.post(CREATE_EVENT, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const getEventsFn = async () => {
  try {
    const response = await api.get(GET_EVENTS);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const getAllEventsFn = async (params) => {
  try {
    const response = await api.get(GET_ALL_EVENTS, { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const getEventFn = async (id: string) => {
  try {
    const response = await api.get(`${GET_EVENT}/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const eventRegistrationFn = async (id: string, payload: any) => {
  try {
    const response = await api.post(`${GET_EVENT}/${id}/register`, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const checkEventRegistrationFn = async (id: string) => {
  try {
    const response = await api.get(`${GET_EVENT}/${id}/registered`, { id: id });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const getAllAttendeesFn = async (id) => {
  try {
    const response = await api.get(`${GET_EVENT}/${id}/attendees`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const getUserProfileFn = async () => {
  try {
    const response = await api.get(GET_USER);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const getUserEventsFn = async () => {
  try {
    const response = await api.get(GET_USER_EVENTS);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const getOrganizedEventsFn = async () => {
  try {
    const response = await api.get(GET_ORGANIZED_EVENTS);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const updateProfileImageFn = async (payload: FormData) => {
  try {
    const response = await api.put(UPDATE_PROFILE_IMAGE, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const getAllTransactionsFn = async () => {
  try {
    const response = await api.get(GET_ALL_TRANSACTIONS);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendErrorMessage = error.response.data.error;

      throw new Error(backendErrorMessage);
    }
    throw new Error("An unexpected error occurred.");
  }
};
