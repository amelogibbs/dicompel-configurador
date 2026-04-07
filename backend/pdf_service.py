from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import cm

def gerar_pdf(orçamento, itens, output_path="orcamento.pdf"):
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4

    # LOGO --------------------------------------------------------------------------------
    c.drawImage("assets/logo_dicompel.png", 2*cm, height - 4*cm, width=4*cm, preserveAspectRatio=True)

    # TÍTULO ------------------------------------------------------------------------------
    c.setFont("Helvetica-Bold", 20)
    c.drawString(2*cm, height - 5.5*cm, f"Orçamento Nº {orçamento['numero_pedido']}")

    # DADOS DO CLIENTE -------------------------------------------------------------------
    c.setFont("Helvetica", 12)
    y = height - 7*cm
    c.drawString(2*cm, y, f"Cliente: {orçamento['cliente']}")
    c.drawString(2*cm, y - 0.6*cm, f"E-mail: {orçamento['email']}")
    c.drawString(2*cm, y - 1.2*cm, f"Telefone: {orçamento['telefone']}")
    c.drawString(2*cm, y - 1.8*cm, f"Representante: {orçamento['representante']}")

    # TABELA DE PRODUTOS -----------------------------------------------------------------
    y -= 3*cm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(2*cm, y, "Código")
    c.drawString(5*cm, y, "Descrição")
    c.drawString(14*cm, y, "Qtd.")
    c.line(2*cm, y - 0.2*cm, 19*cm, y - 0.2*cm)

    c.setFont("Helvetica", 11)
    y -= 1*cm
    total = 0

    for item in itens:
        c.drawString(2*cm, y, item["code"])
        c.drawString(5*cm, y, item["description"])
        c.drawString(14*cm, y, str(item["quantity"]))
        y -= 0.8*cm

        if y < 3*cm:
            c.showPage()
            y = height - 3*cm

    # TOTAL ------------------------------------------------------------------------------
    c.setFont("Helvetica-Bold", 14)
    c.drawString(2*cm, y - 1*cm, f"Total de Itens: {sum(i['quantity'] for i in itens)}")

    # ASSINATURA -------------------------------------------------------------------------
    c.setFont("Helvetica", 10)
    c.drawString(2*cm, 2*cm, "Dicompel — Catálogo & Configurador de Produtos")

    c.save()
    return output_path