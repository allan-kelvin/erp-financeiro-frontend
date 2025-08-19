export interface Fornecedor {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  ie: string | null;
  dataCadastro: Date;
  ativo: boolean;
  telefone: string;
  whatsapp: string | null;
  email: string | null;
}
