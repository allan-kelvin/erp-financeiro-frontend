import { BandeiraEnum } from "../../cartoes/enums/cartaoEnum.enum";
import { TipoDespesaEnum } from "../enums/TipoDespesaEnum";


export interface Despesa {
  id: number;
  descricao: string;
  valor_total: number;
  parcelado: boolean;
  qtd_parcelas?: number | null;
  valor_parcela?: number | null;
  total_com_juros?: number | null;
  data_lancamento: string;
  data_fim_parcela?: string | null;
  tipo_despesa: TipoDespesaEnum;
  cartaoId: number;
  usuarioId: number;
  juros_aplicado?: number | null;
  qant_parcelas_restantes?: number | null;


  cartao?: {
    id: number;
    descricao: string;
    bandeira: BandeiraEnum;
    tipo_cartao: BandeiraEnum;
    imagem_cartao?: string | null;
  };
  usuario?: {
    id: number;
    nome: string;
    email: string;
  };

  created_at: string;
  updated_at: string;
}
