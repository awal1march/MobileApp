import kivy
from kivy.app import App
from kivy.uix.label import Label
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
import requests
import json


API_BASE = "http://127.0.0.1:8000"  # FastAPI backend

class MyApp(App):
    def build(self):
        self.layout = BoxLayout(orientation='vertical', padding=10, spacing=10)
        
        # Label to display API response
        self.label = Label(text="Waiting for API response...")
        self.layout.add_widget(self.label)
        
        # Buttons to load different screens
        wallet_btn = Button(text="Load Wallet Screen")
        wallet_btn.bind(on_press=lambda x: self.load_screen("/wallet"))
        self.layout.add_widget(wallet_btn)
        
        home_btn = Button(text="Load Home Screen")
        home_btn.bind(on_press=lambda x: self.load_screen("/home"))
        self.layout.add_widget(home_btn)
        
        profile_btn = Button(text="Load Profile Screen")
        profile_btn.bind(on_press=lambda x: self.load_screen("/profile"))
        self.layout.add_widget(profile_btn)
        
        # Inputs for buying a bundle
        self.phone_input = TextInput(hint_text="Phone Number", multiline=False)
        self.layout.add_widget(self.phone_input)
        self.bundle_input = TextInput(hint_text="Bundle ID", multiline=False)
        self.layout.add_widget(self.bundle_input)
        self.cost_input = TextInput(hint_text="Cost Price", multiline=False, input_filter='float')
        self.layout.add_widget(self.cost_input)
        
        buy_btn = Button(text="Buy Data Bundle")
        buy_btn.bind(on_press=lambda x: self.buy_bundle())
        self.layout.add_widget(buy_btn)
        
        return self.layout
    
    def load_screen(self, endpoint):
        try:
            response = requests.get(API_BASE + endpoint)
            if response.status_code == 200:
                data = response.json()
                # Some endpoints return "message", some "status" or "data"
                if "message" in data:
                    self.label.text = data["message"]
                elif "status" in data:
                    self.label.text = json.dumps(data, indent=2)
                else:
                    self.label.text = str(data)
            else:
                self.label.text = f"Error {response.status_code}: {response.text}"
        except Exception as e:
            self.label.text = f"Error: {e}"
    
    def buy_bundle(self):
        try:
            phone = self.phone_input.text.strip()
            bundle = self.bundle_input.text.strip()
            cost = self.cost_input.text.strip()
            
            if not phone or not bundle or not cost:
                self.label.text = "Please fill in all fields"
                return
            
            payload = {
                "phone_number": phone,
                "bundle_id": bundle,
                "cost_price": float(cost)
            }
            
            response = requests.post(API_BASE + "/buy-data", json=payload)
            if response.status_code == 200:
                data = response.json()
                transaction = data.get("transaction", {})
                self.label.text = (
                    f"Bought {transaction.get('bundle_name')}\n"
                    f"Selling Price: {transaction.get('selling_price')}\n"
                    f"Profit: {transaction.get('profit')}\n"
                    f"Order ID: {transaction.get('order_id')}"
                )
            else:
                self.label.text = f"Error {response.status_code}: {response.text}"
        except Exception as e:
            self.label.text = f"Error: {e}"

if __name__ == "__main__":
    MyApp().run()

