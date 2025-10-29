import mqtt from 'mqtt';
import 'dotenv/config';

const client = mqtt.connect(`mqtts://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
  rejectUnauthorized: false,
});

client.on('connect', () => {
  console.log('✅ Conectado al broker MQTT');
  const tankId = 1;
  const name = 'Tanque 1';
  let fills = 5;

  // Publicar datos cada 5 segundos
  setInterval(() => {
    const level = parseFloat((Math.random() * 100).toFixed(1));
    const liters = parseFloat(((level / 100) * 1000).toFixed(0));

    const message = { tankId, name, level, liters, online: true, fills };
    console.log('📤 Publicando:', message);
    client.publish('tank/level', JSON.stringify(message));

    // Simular llenado completo
    if (level > 90) fills++;
  }, 5000);
});
