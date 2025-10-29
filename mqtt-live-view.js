import mqtt from 'mqtt';
import 'dotenv/config';

const client = mqtt.connect(`mqtts://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
  rejectUnauthorized: false,
});

client.on('connect', () => {
  console.log('✅ Conectado al broker MQTT');
  client.subscribe('tank/level', () => console.log('📡 Suscrito al topic tank/level'));
});

client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log('📥 Datos recibidos del sensor:', data);
  } catch {
    console.error('❌ Error procesando mensaje');
  }
});
