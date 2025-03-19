<?php
// Vérifier si la méthode utilisée est POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Vérifier si la ville est fournie dans la requête
    if (isset($_POST['city']) && !empty($_POST['city'])) {
        // Récupérer la ville depuis la requête
        $city = $_POST['city'];

        // Détails de connexion à la base de données
        $host = 'localhost';
        $dbname = 'meteo';
        $username = 'root';  // Remplacer par ton nom d'utilisateur MySQL
        $password = 'OUI';  // Remplacer par ton mot de passe MySQL

        try {
            // Connexion à la base de données
            $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Préparer la requête pour insérer la ville dans la table "recherches"
            $stmt = $pdo->prepare("INSERT INTO recherches (city) VALUES (:city)");
            $stmt->bindParam(':city', $city);
            $stmt->execute(); // Exécuter l'insertion

            echo "Recherche enregistrée avec succès."; // Confirmation de l'enregistrement
        } catch (PDOException $e) {
            // Si une erreur se produit lors de la connexion ou de l'insertion
            echo "Erreur lors de l'enregistrement de la recherche : " . $e->getMessage();
        }
    } else {
        // Si le champ "city" est manquant ou vide
        echo "La ville est manquante.";
    }
} else {
    // Si la méthode HTTP n'est pas POST
    echo "Méthode incorrecte, veuillez utiliser POST.";
}
?>
