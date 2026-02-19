# pricing.py

def calculate_selling_price(cost):
    """
    Calculate selling price with:
    10% markup + 0.50 flat fee
    """
    percent_markup = 0.10
    flat_fee = 0.50
    selling_price = cost * (1 + percent_markup) + flat_fee
    return round(selling_price, 2)


def calculate_profit(cost):
    return round(calculate_selling_price(cost) - cost, 2)
