import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed", isValid: false });
    return;
  }

  // Quando o getServerSession é chamado e o token estiver desatualizado
  // então ele vai atualizar o token e disponibilizar na sessão para os MFs
  //
  // Obs.: Esse endpoint só pode ser chamado por client side, caso contrário
  // a sessão não vai ser atualizado
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: "Unauthorized", isValid: false }); // Unauthorized
    return;
  }

  res.status(200).json({ message: "ok", isValid: true });
}
