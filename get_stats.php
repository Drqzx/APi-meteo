<?php
// Détails de connexion à la base de données
$host = 'localhost';
$dbname = 'meteo';
$username = 'root';  // Remplacer par ton nom d'utilisateur MySQL
$password = 'OUI';  // Remplacer par ton mot de passe MySQL

try {
    // Connexion à la base de données
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Requête pour récupérer le nombre de recherches par ville
    $stmt = $pdo->query("SELECT city, COUNT(*) as count FROM recherches GROUP BY city");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Retourner les résultats sous forme de JSON
    echo json_encode($data);
} catch (PDOException $e) {
    // Si une erreur se produit lors de la connexion ou de la récupération des données
    echo json_encode(['error' => $e->getMessage()]);
}
?>
