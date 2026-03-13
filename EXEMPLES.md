# Exemples de Fichiers pour le TIPE Logbook

## 📊 Exemple CSV - Résultats d'expériences

```csv
date,experience,temperature,resistance,courant,commentaire
2026-02-10,Test câble A,20,45.2,2.1,"Conditions normales"
2026-02-10,Test câble B,20,47.8,2.0,"Légèrement supérieur"
2026-02-15,Test câble A,35,48.3,1.9,"Température élevée"
2026-02-15,Test câble B,35,51.2,1.8,"Impact thermique visible"
2026-02-20,Test câble A,5,43.1,2.3,"Basse température"
2026-02-20,Test câble B,5,45.6,2.2,"Meilleure conductivité"
```

## 💻 Exemple Code C - Calcul de résistance thermique

```c
#include <stdio.h>
#include <math.h>

// Calcul de la résistance en fonction de la température
// R(T) = R0 * (1 + alpha * (T - T0))

double calculer_resistance(double R0, double T0, double T, double alpha) {
    return R0 * (1 + alpha * (T - T0));
}

// Calcul de la perte de puissance (P = R * I²)
double perte_puissance(double R, double I) {
    return R * I * I;
}

int main() {
    double R0, T0, T, alpha, I;
    
    printf("=== Calculateur de Résistance Thermique ===\n\n");
    
    printf("Entrez la résistance à T0 (Ohms): ");
    scanf("%lf", &R0);
    
    printf("Entrez la température de référence T0 (°C): ");
    scanf("%lf", &T0);
    
    printf("Entrez la température actuelle T (°C): ");
    scanf("%lf", &T);
    
    printf("Entrez le coefficient thermique alpha (1/°C): ");
    scanf("%lf", &alpha);
    
    printf("Entrez le courant (A): ");
    scanf("%lf", &I);
    
    double R = calculer_resistance(R0, T0, T, alpha);
    double P = perte_puissance(R, I);
    
    printf("\n--- Résultats ---\n");
    printf("Résistance à %.1f°C: %.4f Ohms\n", T, R);
    printf("Perte de puissance: %.4f W\n", P);
    printf("Variation de résistance: %.2f%%\n", ((R - R0) / R0) * 100);
    
    return 0;
}
```

### Exemple d'entrées pour le programme C ci-dessus :

```
45.0
20.0
35.0
0.00393
2.1
```

Résultat attendu :
```
=== Calculateur de Résistance Thermique ===

Entrez la résistance à T0 (Ohms): Entrez la température de référence T0 (°C): Entrez la température actuelle T (°C): Entrez le coefficient thermique alpha (1/°C): Entrez le courant (A): 
--- Résultats ---
Résistance à 35.0°C: 47.6543 Ohms
Perte de puissance: 210.0567 W
Variation de résistance: 5.90%
```

## 💻 Exemple Code C - Fibonacci avec optimisation

```c
#include <stdio.h>

// Fibonacci récursif simple
int fib_recursif(int n) {
    if (n <= 1) return n;
    return fib_recursif(n-1) + fib_recursif(n-2);
}

// Fibonacci itératif optimisé
int fib_iteratif(int n) {
    if (n <= 1) return n;
    
    int a = 0, b = 1, temp;
    for (int i = 2; i <= n; i++) {
        temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

int main() {
    int n;
    
    printf("Calcul de Fibonacci\n");
    printf("Entrez n (recommandé: n < 40 pour récursif): ");
    scanf("%d", &n);
    
    if (n < 0) {
        printf("Erreur: n doit être positif\n");
        return 1;
    }
    
    printf("\nMéthode itérative (rapide):\n");
    printf("F(%d) = %d\n", n, fib_iteratif(n));
    
    if (n <= 35) {
        printf("\nMéthode récursive (plus lente):\n");
        printf("F(%d) = %d\n", n, fib_recursif(n));
    } else {
        printf("\nn trop grand pour la méthode récursive (limité à 35)\n");
    }
    
    return 0;
}
```

## 📊 Exemple CSV - Données énergétiques de câbles

```csv
type_cable,longueur_m,section_mm2,materiau,resistance_ohm_km,capacite_A,prix_euro_m
Cuivre standard,100,2.5,Cuivre,7.41,25,1.50
Cuivre renforcé,100,4.0,Cuivre,4.61,32,2.20
Fibre optique,100,N/A,Verre,N/A,N/A,3.50
Aluminium,100,2.5,Aluminium,12.2,20,0.80
Cuivre isolé,100,6.0,Cuivre,3.08,40,3.10
Coaxial,100,N/A,Cuivre/Isolant,N/A,N/A,2.00
```

## 💻 Exemple Code C - Analyse de données de câbles

```c
#include <stdio.h>
#include <string.h>

struct Cable {
    char type[50];
    double longueur;
    double section;
    double resistance_km;
    double capacite;
};

double calculer_chute_tension(double resistance_km, double longueur, double courant) {
    double resistance_totale = (resistance_km / 1000.0) * longueur;
    return resistance_totale * courant;
}

double calculer_perte_puissance(double resistance_km, double longueur, double courant) {
    double resistance_totale = (resistance_km / 1000.0) * longueur;
    return resistance_totale * courant * courant;
}

int main() {
    struct Cable cable;
    double courant;
    
    printf("=== Analyse de Câble Électrique ===\n\n");
    
    printf("Type de câble: ");
    scanf("%s", cable.type);
    
    printf("Longueur (m): ");
    scanf("%lf", &cable.longueur);
    
    printf("Résistance (Ohm/km): ");
    scanf("%lf", &cable.resistance_km);
    
    printf("Courant nominal (A): ");
    scanf("%lf", &courant);
    
    double chute_V = calculer_chute_tension(cable.resistance_km, cable.longueur, courant);
    double perte_W = calculer_perte_puissance(cable.resistance_km, cable.longueur, courant);
    
    printf("\n--- Analyse pour %s ---\n", cable.type);
    printf("Longueur: %.1f m\n", cable.longueur);
    printf("Courant: %.1f A\n", courant);
    printf("\nChute de tension: %.3f V\n", chute_V);
    printf("Perte de puissance: %.3f W\n", perte_W);
    printf("Rendement: %.2f%%\n", 100.0 - (perte_W / (courant * 230) * 100));
    
    return 0;
}
```

### Exemple d'entrées :

```
Cuivre_standard
100
7.41
25
```
