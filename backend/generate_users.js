
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const names = ['Іван', 'Олена', 'Петро', 'Марія', 'Андрій', 'Наталя', 'Богдан', 'Ірина', 'Юрій', 'Тетяна'];
const surnames = ['Коваль', 'Шевченко', 'Бондар', 'Мельник', 'Іванов', 'Сидоренко', 'Кравець', 'Литвин', 'Петренко', 'Гнатюк'];

async function name() {
    for (let i = 110; i <= 120; i++) {
        const name = names[getRandomInt(0, names.length - 1)];
        const surname = surnames[getRandomInt(0, surnames.length - 1)];
        const email = `user${i}@example.com`;
        const phone = `+38067${getRandomInt(1000000, 9999999)}`;
        const password = `testpass${i}`;

        try {
            const res = await fetch('http://localhost:7000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, surname, email, phone, password })
            });

            const result = await res.json();
            if (res.ok) {
                console.log(`✅ ${i}: ${email} — Зареєстровано (ID: ${result.id})`);
            } else {
                console.warn(`⚠️ ${i}: ${email} — Помилка:`, result.error);
            }
        } catch (err) {
            console.error(`❌ ${i}: ${email} — Запит не пройшов`, err);
        }

        await new Promise(r => setTimeout(r, 100));
    }
}

name()