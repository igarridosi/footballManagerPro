class Player:
    def __init__(self, name, position, club, value):
        self.name = name
        self.position = position
        self.club = club
        self.value = value
    
    def inOrDecrisePlayerValue(self, amount):
        if amount < 0:
            amount = abs(amount)
            self.value -= amount
            print(f"The new value of {self.name} is: {self.value}M")
        else:
            self.value += amount
            print(f"The new value of {self.name} is: {self.value}M")
            
    def setNewPlayerValue(self, newValue):
        newValue = abs(newValue)
        self.value = newValue
        print(f"{self.name} new value: {self.value}M")
            
    def setNewClub(self, newClub, transferMoney):
        actualClub = self.club
        self.club = newClub
        print(f"Here We GO!! {self.name} to {self.club}. \nOfficial Agreement in principle with {actualClub}, €{transferMoney}m fee.\nContract might be signed tomorrow. 🚨‼️")
        
        self.setNewPlayerValue(transferMoney)

# Crear una lista de jugadores
players = [
    Player('Angel', 'MC', 'Aston Vila', 20),
    Player('John', 'FW', 'Liverpool', 50),
    Player('Mike', 'GK', 'Chelsea', 30)
]

def display_menu():
    print('----------------------------------------------')
    print('Player Manager:')
    print('0: Display all the players')
    print('1: Increase or Decrease value to a player (The inputed number must be + or -)')
    print('2: Transfer a player')
    print('3: Add a player')
    print('4: Remove player')
    print('5: Exit')

def display_players():
    for i, player in enumerate(players):
        print(f'{i}: {player.name}, {player.position}, {player.club}, {player.value}M')

while True:
    display_menu()
    option = int(input('Choose an option: '))
    print('----------------------------------------------')
    
    if option == 0:
        display_players()
    elif option == 1:
        display_players()
        player_index = int(input('Choose a player by index: '))
        amount = float(input('Enter the amount to increase or decrease the value: '))
        players[player_index].inOrDecrisePlayerValue(amount)
        
    elif option == 2:
        display_players()
        player_index = int(input('Choose a player by index you want to transfer: '))
        new_club = input('Enter the new club: ')
        transfer_money = float(input('Enter the transfer money: '))
        print('----------------------------------------------')
        players[player_index].setNewClub(new_club, transfer_money)
        
    elif option == 3:
        name = input('Enter the player name: ')
        position = input('Enter the player position: ')
        club = input('Enter the player club: ')
        value = input('Enter the player value: ')
        players.append(Player(name, position, club, value))
        print('Player list updated!!')
        display_players()
        
    elif option == 4:
        display_players()
        playerIndex = int(input('Enter the index of the player you want to remove: '))
        players.pop(playerIndex)
        print('Player remove succesfully!')
    
    elif option == 5:
        print('Bye!')
        break
        
    else:
        print('Invalid option. Please try again.')