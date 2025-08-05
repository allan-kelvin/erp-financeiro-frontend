import { TipoConta } from "../enums/tipoConta.enum";

export interface Banco {
  id: number;
  nome: string;
  ativo: boolean;
  tipo_conta: TipoConta;
  imagem_banco?: string;
}
