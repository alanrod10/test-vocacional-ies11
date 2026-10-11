import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Configuración de estilo
sns.set_theme(style="whitegrid")
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['axes.titlesize'] = 14
plt.rcParams['axes.labelsize'] = 12

# Cargar datos
try:
    df = pd.read_csv('/home/ubuntu/upload/resultados-vocacional-ies11-2026-08-22.csv', sep=';', encoding='utf-8-sig')
    output_dir = '/home/ubuntu/assets_informe'
    
    # 1. Distribución de Edad
    plt.figure()
    sns.histplot(df['Edad'], bins=15, kde=True, color='#1e40af')
    plt.title('Distribución de Edad de los Participantes')
    plt.xlabel('Edad')
    plt.ylabel('Frecuencia')
    plt.savefig(os.path.join(output_dir, 'dist_edad.png'))
    plt.close()

    # 2. Distribución de Sexo
    plt.figure()
    df['Sexo'].value_counts().plot(kind='bar', color=['#1e40af', '#3b82f6', '#93c5fd'])
    plt.title('Distribución por Sexo')
    plt.xlabel('Sexo')
    plt.ylabel('Cantidad')
    plt.xticks(rotation=0)
    plt.savefig(os.path.join(output_dir, 'dist_sexo.png'))
    plt.close()

    # 3. Top 10 Tecnicaturas (Afinidad 1)
    plt.figure()
    top_carreras = df['Afinidad_1_Carrera'].value_counts().head(10)
    top_carreras.sort_values().plot(kind='barh', color='#1e40af')
    plt.title('Top 10 Tecnicaturas con Mayor Afinidad Principal')
    plt.xlabel('Cantidad de Participantes')
    plt.ylabel('Tecnicatura')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'top_carreras.png'))
    plt.close()

    # 4. Distribución de Áreas Vocacionales
    plt.figure()
    df['Area'].value_counts().plot(kind='bar', color='#3b82f6')
    plt.title('Interés por Área Vocacional')
    plt.xlabel('Área')
    plt.ylabel('Cantidad')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'dist_areas.png'))
    plt.close()

    # 5. Situación Educativa
    plt.figure()
    df['Situacion_Educativa'].value_counts().plot(kind='bar', color='#60a5fa')
    plt.title('Situación Educativa de los Participantes')
    plt.xlabel('Situación')
    plt.ylabel('Cantidad')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'dist_situacion.png'))
    plt.close()

    # 6. Intención de estudiar en el IES 11
    plt.figure()
    df['Intencion_Estudiar_IES11'].value_counts().plot(kind='pie', autopct='%1.1f%%', startangle=140, colors=sns.color_palette('Blues_r'))
    plt.title('Intención de Estudiar en el IES N.° 11')
    plt.ylabel('')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'intencion_ies11.png'))
    plt.close()

    print("Gráficos generados exitosamente.")

except Exception as e:
    print(f"Error al generar gráficos: {e}")
