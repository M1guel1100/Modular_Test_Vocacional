import numpy as np
import pandas as pd
import psycopg2
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.utils import to_categorical

# Función para elegir las próximas preguntas
def choose_next_questions(selected_careers, pregunta_carrera_data, num_questions=5):
    question_scores = np.zeros(preguntas_data.shape[0])
    
    for career_id in selected_careers:
        related_questions = pregunta_carrera_data[pregunta_carrera_data['CarreraID'] == career_id]['PreguntaID']
        question_scores[related_questions - 1] += 1
    
    available_questions = pregunta_carrera_data[~pregunta_carrera_data['PreguntaID'].isin(selected_careers)]['PreguntaID']
    available_question_scores = question_scores[available_questions - 1]
    
    if available_question_scores.max() > 0:
        # Ordenar preguntas por puntuación y seleccionar las mejor puntuadas
        next_question_ids = available_questions.iloc[np.argsort(available_question_scores)[::-1][:num_questions]]
    else:
        # Si no hay suficiente información, elegir aleatoriamente
        next_question_ids = available_questions.sample(min(num_questions, len(available_questions)))
    
    return next_question_ids.tolist()

# Conexión a la base de datos
conexion = psycopg2.connect(
    host="localhost",
    port="5432",
    database="modular",
    user="postgres",
    password="0000"
)

preguntas_data = pd.read_sql_query("SELECT * FROM preguntas", conexion)
pregunta_carrera_data = pd.read_sql_query("SELECT * FROM preguntas_carreras", conexion)
carrera_data = pd.read_sql_query("SELECT * FROM carreras", conexion)

num_preguntas = preguntas_data.shape[0]  # Número de preguntas
num_carreras = carrera_data['CarreraID'].nunique()  # Número total de carreras

X = np.zeros((num_preguntas, num_carreras))
for index, row in pregunta_carrera_data.iterrows():
    pregunta_id = row['PreguntaID'] - 1
    carrera_id = row['CarreraID'] - 1
    X[pregunta_id, carrera_id] = 1

y = pregunta_carrera_data['CarreraID'].values

# Codificar etiquetas de carrera como one-hot
y_one_hot = to_categorical(y, num_carreras)

def build_model(input_shape, output_shape):
    model = keras.Sequential([
        layers.Input(shape=(input_shape,)),
        layers.Dense(128, activation='relu'),
        layers.Dense(output_shape, activation='softmax')
    ])
    return model

input_shape = X.shape[1]  # Número de carreras
output_shape = num_carreras  # Número de carreras

model = build_model(input_shape, output_shape)

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.fit(X, y_one_hot, epochs=200, batch_size=32, validation_split=0.4)

model.save("modelo_recomendacion.h5")

# Interacción con el usuario
selected_careers = []
asked_questions = set()

# Preguntas generales
general_questions = choose_next_questions(selected_careers, pregunta_carrera_data, num_questions=15)

for next_question_id in general_questions:
    next_question_text = preguntas_data.loc[preguntas_data['PreguntaID'] == next_question_id, 'TextoPregunta']
    
    if not next_question_text.empty:
        next_question_text = next_question_text.iloc[0]
    else:
        print("Pregunta no encontrada en la base de datos.")
        continue
    
    print(next_question_text)
    respuesta = input("Respuesta (Sí/No): ").strip().lower()
    
    if respuesta == "sí" or respuesta == "si":
        selected_careers.append(next_question_id)
        asked_questions.add(next_question_id)

# Preguntas específicas y relevantes
while len(selected_careers) < 3:
    next_question_ids = choose_next_questions(selected_careers, pregunta_carrera_data)
    
    for next_question_id in next_question_ids:
        if next_question_id in asked_questions:
            continue
        
        next_question_text = preguntas_data.loc[preguntas_data['PreguntaID'] == next_question_id, 'TextoPregunta']
        
        if not next_question_text.empty:
            next_question_text = next_question_text.iloc[0]
        else:
            print("Pregunta no encontrada en la base de datos.")
            continue
        
        print(next_question_text)
        respuesta = input("Respuesta (Sí/No): ").strip().lower()
        
        if respuesta == "sí" or respuesta == "si":
            selected_careers.append(next_question_id)
            asked_questions.add(next_question_id)
            break  # Salir del bucle si se obtiene una respuesta afirmativa

        if len(next_question_ids) == 0:
            print("No quedan más preguntas relevantes.")
            break  # Salir del bucle si no hay más preguntas relevantes

# Realizar predicciones con el modelo
input_data = np.zeros((1, num_carreras))
input_data[0, selected_careers] = 1
predictions = model.predict(input_data)

# Obtener las 3 carreras recomendadas con mayor probabilidad
recommendations = np.argsort(predictions[0])[::-1][:3]
recommended_careers = carrera_data[carrera_data['CarreraID'].isin(recommendations)]['NombreCarrera'].tolist()
print("Carreras recomendadas:", recommended_careers)
