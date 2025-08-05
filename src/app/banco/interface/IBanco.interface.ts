import { TipoConta } from "../enums/tipoConta.enum";

export interface IBanco {
  id: number;
  nome: string;
  ativo: boolean;
  tipo_banco: TipoConta;
  imagem?: string;
}
