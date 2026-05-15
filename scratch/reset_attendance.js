const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetAttendance() {
  console.log("Démarrage de la réinitialisation des présences...");
  try {
    const result = await prisma.guest.updateMany({
      data: {
        attendance: "{}"
      }
    });
    console.log(`Succès : ${result.count} invités ont été réinitialisés.`);
  } catch (error) {
    console.error("Erreur lors de la réinitialisation :", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAttendance();
