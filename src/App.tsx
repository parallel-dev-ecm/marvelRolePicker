import { useState, useEffect } from "react";
import "./App.css";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";

interface Player {
  id: string;
  name: string;
  role: string;
}

function App() {
  const [players, setPlayers] = useState<Player[]>([]);

  const firebaseConfig = {
    apiKey: "AIzaSyD1vHThidsK8F_6pfskoiRsId_GpF0BLm8",
    authDomain: "marvelheropicker.firebaseapp.com",
    projectId: "marvelheropicker",
    storageBucket: "marvelheropicker.firebasestorage.app",
    messagingSenderId: "693335238236",
    appId: "1:693335238236:web:2bde3f078a7198efbd6899",
    measurementId: "G-X8D6K5R02F",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Your friends' names
  const friendNames = ["pinky", "jhony", "diega", "paula", "alan", "cortes"]; // Replace with actual names
  const roles = ["DPS", "Tank", "Healer"];
  const maxPerRole = {
    DPS: 2,
    Tank: 2,
    Healer: 2,
  };

  useEffect(() => {
    // Fetch current assignments from Firestore
    const fetchPlayers = async () => {
      const querySnapshot = await getDocs(collection(db, "rolPorPersona"));
      const playerData: Player[] = [];
      querySnapshot.forEach((doc) => {
        playerData.push(doc.data() as Player);
      });
      setPlayers(playerData);
    };

    fetchPlayers();
  }, [db]);

  const assignRoles = async () => {
    const shuffledNames = [...friendNames].sort(() => Math.random() - 0.5);
    const newPlayers: Player[] = [];
    const roleCounts = { DPS: 0, Tank: 0, Healer: 0 };

    for (const name of shuffledNames) {
      // Get available roles (roles that haven't reached their max)
      const availableRoles = roles.filter(
        (role) =>
          roleCounts[role as keyof typeof roleCounts] <
          maxPerRole[role as keyof typeof maxPerRole]
      );

      if (availableRoles.length === 0) {
        console.error("Not enough role slots for all players");
        return;
      }

      // Randomly select from available roles
      const selectedRole =
        availableRoles[Math.floor(Math.random() * availableRoles.length)];
      roleCounts[selectedRole as keyof typeof roleCounts]++;

      newPlayers.push({
        id: name.toLowerCase(),
        name,
        role: selectedRole,
      });
    }

    // Update Firestore
    for (const player of newPlayers) {
      await setDoc(doc(db, "rolPorPersona", player.id), player);
    }

    // Update local state
    setPlayers(newPlayers);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold mb-4">Role Picker</h1>

        <Button onClick={assignRoles} className="w-full mb-6">
          Assign Random Roles
        </Button>

        <div className="space-y-4">
          {players.map((player) => (
            <div
              key={player.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <span className="font-medium">{player.name}</span>
              <span
                className={`px-3 py-1 rounded-full ${
                  player.role === "Tank"
                    ? "bg-blue-100 text-blue-800"
                    : player.role === "Healer"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {player.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
