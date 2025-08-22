import { BandeiraEnum } from "../../cartoes/enums/cartaoEnum.enum";
import { CategoriaEnum } from "../enums/CategoriaEnum";
import { FormaDePagamentoEnum } from "../enums/FormaDePagamentoEnum";
import { GrupoEnum } from "../enums/GrupoEnum";


export interface Despesa {
  id: number;
  descricao: string;
  categoria: CategoriaEnum;
  grupo: GrupoEnum;
  valor: number;
  formaDePagamento: FormaDePagamentoEnum
  parcelado: boolean;
  qtd_parcelas?: number;
  valor_parcela?: number;
  total_com_juros?: number;
  juros_aplicado?: number;
  data_lancamento: string;
  data_fim_parcela?: string;

  cartaoId?: number;
  subCategoriaId: number;
  fornecedorId?: number;
  bancoId?: number;
  usuarioId: number;

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

  subCategoria?: {
    id: number;
    descricao: string;
  };
  fornecedor?: {
    id: number;
    nome: string;
  };
  banco?: {
    id: number;
    descricao: string;
  };

  created_at: string;
  updated_at: string;
}
