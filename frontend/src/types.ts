export interface Product {
  ProductID: string;
  ProductCode: string;
  ProductName: string;
  Category?: string;
  Brand?: string;
  Line?: string;
  TechnicalSpecs?: string;
  ImageData?: string;
  imageUrl?: string;
  Warranty?: string;
  CreatedAt?: string;
  amperage?: string;
  reference?: string;
  colors?: string[];
  description?: string;
  code?: string;
  line?: string;
  category?: string;
  id?: string;
}

export interface OrderItem {
  OrderItemID: string;
  OrderID: number;
  ProductID: string;
  ProductCode: string;
  ProductName: string;
  Quantity: number;
  UnitPrice: number;
}

export interface Order {
  OrderID: number;
  OrderNumber: string;
  CustomerName: string;
  CustomerEmail: string;
  CustomerPhone: string;
  RepresentativeID: string;
  Region: string;
  TotalAmount: number;
  Status: string;
  CreatedAt: string;
  items?: OrderItem[];
}

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  criado_em: string;
}

export interface CartItem extends Product {
  quantity?: number;
}