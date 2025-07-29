import { BandeiraEnum, StatusCartaoEnum, TipoCartaoEnum } from "../enums/cartaoEnum.enum";

export interface Cartao {
  id: number;
  descricao: string;
  bandeira: BandeiraEnum;
  tipo_cartao: TipoCartaoEnum;
  imagem_cartao?: string | null;
  status: StatusCartaoEnum;
  usuarioId: number;
  created_at: Date;
  updated_at: Date;
}
