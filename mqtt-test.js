import mqtt from 'mqtt';
import 'dotenv/config';

const client = mqtt.connect(`mqtts://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
  rejectUnauthorized: false,
});

client.on('connect', () => {
  console.log('✅ Conectado al broker MQTT');

  // Simula datos de sensor
  const data = {
    tankId: 1,
    name: 'Tanque 1',
    level: Math.random() * 100,
    liters: Math.random() * 1000,
    online: true,
    fills: 5
  };

  client.publish('tank/level', JSON.stringify(data), () => {
    console.log('📤 Mensaje publicado:', data);
    client.end();
  });
});
