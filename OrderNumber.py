def create_order(db_session, order_data, cart_items):
    # 1. Insere o pedido principal
    new_order = Order(
        CustomerName=order_data['name'],
        CustomerEmail=order_data['email'],
        Region=order_data['region'],
        RepresentativeID=order_data['rep_id']
    )
    db_session.add(new_order)
    db_session.flush()  # Gera o OrderID interno

    # 2. Insere os itens do carrinho
    for item in cart_items:
        order_item = OrderItem(
            OrderID=new_order.OrderID,
            ProductCode=item['code'],
            Quantity=item['qty'],
            UnitPrice=item['price']
        )
        db_session.add(order_item)

    db_session.commit()

    # O Azure SQL já terá gerado o OrderNumber (ex: DCP-001001)
    return new_order.OrderNumber