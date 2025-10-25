import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface Activity {
  message: string;
  timestamp: string;
  type: string;
  projectId?: string;
}

export const getUserActivities = async (userId: string): Promise<Activity[]> => {
  const res = await axios.get(`${BASE_URL}/api/activities/list`, {
    params: { userId },
  });
  return res.data.activities || [];
};

export const addUserActivity = async (
  userId: string,
  message: string,
  type: string,
  projectId?: string
) => {
  await axios.post(`${BASE_URL}/api/activities/add`, {
    userId,
    message,
    type,
    projectId,
  });
};
