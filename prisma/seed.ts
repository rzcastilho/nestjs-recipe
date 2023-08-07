import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const categories = [
    {
        "name": "Technology Trends",
        "description": "Explore the latest advancements and innovations in the world of technology, including updates on AI, robotics, virtual reality, IoT, and more."
    },
    {
        "name": "Travel Diaries",
        "description": "Embark on virtual journeys with travel enthusiasts as they share their adventures, experiences, and tips from various destinations around the globe."
    },
    {
        "name": "Health & Wellness",
        "description": "Dive into a variety of topics related to health and well-being, covering fitness routines, nutrition advice, mental health, mindfulness practices, and healthy lifestyle choices."
    },
    {
        "name": "Book Reviews",
        "description": "Discover literary treasures and insightful critiques of books from different genres, providing readers with recommendations and thought-provoking analyses."
    },
    {
        "name": "Recipe Collections",
        "description": "Satisfy your culinary cravings with a collection of delicious recipes ranging from traditional dishes to experimental creations, catering to various dietary preferences."
    },
    {
        "name": "Personal Development",
        "description": "Uncover strategies and guidance for self-improvement, self-awareness, and personal growth, empowering individuals to achieve their full potential."
    },
    {
        "name": "Environmental Sustainability",
        "description": "Join the conversation on environmental issues, eco-friendly initiatives, conservation efforts, and sustainable practices to protect our planet's natural resources."
    },
    {
        "name": "Art & Creativity",
        "description": "Immerse yourself in the world of art and creativity, exploring various forms of artistic expression, including paintings, sculptures, photography, music, and more."
    },
    {
        "name": "Career Insights",
        "description": "Get valuable insights into career development, job-seeking tips, interview strategies, workplace culture, and professional growth opportunities."
    },
    {
        "name": "Science & Discovery",
        "description": "Delve into the wonders of science, space exploration, archaeological findings, and discoveries that expand our understanding of the universe and our place in it."
    }
]

async function main() {
    await prisma.category.deleteMany()
    await prisma.$queryRaw`UPDATE sqlite_sequence SET seq = 0 WHERE name = 'Category';`
    await Promise.all(
        categories.map(async (category) =>
            await prisma.category.create({data: category})
        )
    )
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
