import { NextApiRequest, NextApiResponse } from "next";

export default function User(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const id = request.query;

  const users = [
    { id: "3d3d8f8f-fe70-42f6-8dec-e84143545928", name: "Yan" },
    { id: "ef6f6b35-6760-4956-976d-a4f46dc54f4f", name: "Diego" },
    { id: "0ef30ea0-5033-4725-bc29-7e3aa03e3b08", name: "Mayk" },
  ];

  return response.json(users);
}
