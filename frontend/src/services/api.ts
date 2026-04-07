import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

/* ============================
   AUTH SERVICE
============================= */
export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await api.post("/login", { email, password });

      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem("dicompel_user", JSON.stringify(user));
        return { success: true, user };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch {
      return { success: false, message: "Erro de comunicação com o servidor" };
    }
  },

  getCurrentUser() {
    const data = localStorage.getItem("dicompel_user");
    return data ? JSON.parse(data) : null;
  },

  logout() {
    localStorage.removeItem("dicompel_user");
  },
};

/* ============================
   PRODUCT SERVICE
============================= */
export const productService = {
  async getAll() {
    const response = await api.get("/products");
    return response.data;
  },

  async create(data: any) {
    const response = await api.post("/products", data);
    return response.data;
  },

  async delete(id: string | number) {
    const response = await api.delete(`/products/${String(id)}`);
    return response.data;
  }
};

/* ============================
   USER SERVICE
============================= */
export const userService = {
  async getAll() {
    const response = await api.get("/users");
    return response.data;
  },

  // Método para buscar apenas representantes
  async getReps() {
    try {
      const response = await api.get("/users");
      const allUsers = response.data;

      // Filtra apenas representantes e supervisores
      const filtered = allUsers.filter((user: any) =>
        user.perfil?.toLowerCase() === "representante" || user.perfil?.toLowerCase() === "supervisor"
      );

      return filtered;
    } catch (err) {
      console.error("Erro ao buscar representantes da API:", err);

      // FALLBACK: Dados mock quando não há representantes cadastrados
      console.warn("Usando representantes mock (dados de exemplo)");
      return [
        {
          id: "1",
          name: "João Silva",
          email: "joao@dicompel.com",
          perfil: "REPRESENTANTE"
        },
        {
          id: "2",
          name: "Maria Santos",
          email: "maria@dicompel.com",
          perfil: "REPRESENTANTE"
        },
        {
          id: "3",
          name: "Carlos Oliveira",
          email: "carlos@dicompel.com",
          perfil: "SUPERVISOR"
        }
      ];
    }
  },
};

/* ============================
   ORDER SERVICE
============================= */
export const orderService = {
  async getAll() {
    const response = await api.get("/orders");
    return response.data;
  },

  async getByRep(repId: string) {
    const response = await api.get(`/orders/representante/${repId}`);
    return response.data;
  },

  async updateStatus(orderId: string, newStatus: string) {
    const response = await api.put(`/orders/${orderId}`, {
      status: newStatus,
    });
    return response.data;
  },

  async update(order: any) {
    const response = await api.put(`/orders/${order.id}`, order);
    return response.data;
  },

  async delete(orderId: string) {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },

  async create(order: any) {
    const response = await api.post("/orders", order);
    return response.data;
  },
};