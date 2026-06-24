# Artículos del Código de Trabajo de El Salvador: Jornada de Trabajo y Semana Laboral

A continuación se presentan de forma literal los artículos del 161 al 170 del Código de Trabajo de El Salvador, los cuales regulan la jornada laboral, los horarios, pausas obligatorias y el cálculo de horas extraordinarias:

## Texto Literal de los Artículos

### Art. 161.
Las horas de trabajo son diurnas y nocturnas.
Las diurnas están comprendidas entre las seis horas y las diecinueve horas de un mismo día; y las nocturnas, entre las diecinueve horas de un día y las seis horas del día siguiente.
La jornada ordinaria de trabajo efectivo diurno, salvo las excepciones legales, no excederá de ocho horas diarias, ni la nocturna de siete.
La jornada de trabajo que comprenda más de cuatro horas nocturnas, será considerada nocturna para el efecto de su duración.
La semana laboral diurna no excederá de cuarenta y cuatro horas ni la nocturna de treinta y nueve.

### Art. 162.
En tareas peligrosas o insalubres, la jornada no excederá de siete horas diarias, ni de treinta y nueve horas semanales, si fuere diurna: ni de seis horas diarias, ni de treinta i seis horas semanales, si fuere nocturna.
En los casos de este artículo, la jornada de trabajo que comprenda más de tres y media horas nocturnas, será considerada nocturna, para los efectos de su duración.
SE CONSIDERAN TAREAS PELIGROSAS O INSALUBRES LAS LABORES COMPRENDIDAS EN LOS ARTICULOS 106 Y 108. EN CASO DE DUDA SOBRE SI UNA TAREA ES PELIGROSA O INSALUBRE, SE ESTARA A LA CALIFICACION QUE DE LA MISMA HAGA LA DIRECCION GENERAL DE PREVISION SOCIA.
NO OBSTANTE LO DISPUESTO EN EL INCISO PRIMERO DE ESTE ARTICULO, LOS PATRONOS DE EMPRESAS EN QUE SE REALIZAN TAREAS CONCEPTUADAS COMO PELIGROSAS O INSALUBRES, PODRAN SOLICITAR AL MINISTERIO DE TRABAJO Y PREVISION SOCIAL AUTORIZACION PARA TRABAJAR DE CONFORMIDAD CON LAS NORMAS ESTABLECIDAS EN EL ARTICULO ANTERIOR, LA QUE SE OTORGARA PREVIO DICTAMEN DE LA DIRECCION GENERAL DE PREVISION SOCIAL, EN QUE CONSTE QUE DICHAS EMPRESAS EMPLEAN SISTEMAS Y EQUIPOS DE SEGURIDAD E HIGIENE APROPIADOS A SUS ACTIVIDADES Y QUE LOS RIESGOS PROFESIONALES CON RESPONSABILIDAD PATRONAL NO HAN SIDO FRECUENTES.
LA AUTORIZACION REFERIDA SE REVOCARA, SI VARIAREN EN CUALQUIER TIEMPO LOS EXTREMOS INDICADOS.

### Art. 163.
Considérase tiempo de trabajo efectivo todo aquél en que el trabajador está a disposición del patrono; lo mismo que el de las pausas indispensables para descansar, comer o satisfacer otras necesidades fisiológicas, dentro de la jornada de trabajo.

### Art. 164.
La jornada de trabajo en casos especiales, podrá dividirse hasta en tres partes comprendidas en no más de doce horas, previa autorización del Director General de Trabajo.

### Art. 165.
El patrono fijará originariamente el horario de trabajo: pero las modificaciones posteriores tendrá que hacerlas de acuerdo con los trabajadores. Los casos de desacuerdo serán resueltos por el Director General de Trabajo, atendiendo a lo preceptuado por este Código, convenciones y contratos colectivos, reglamentos internos de trabajo, a la índole de las labores de la empresa y, a falta de esos elementos de juicio, a razones de equidad y buen sentido.

### Art. 166.
Cuando la jornada no fuere dividida, en el horario de trabajo deberán señalarse las pausas para que, dentro de la misma, los trabajadores puedan tomar sus alimentos y descansar. Estas pausas deberán ser de media hora; sin embargo, cuando por la indole del trabajo no pudieren tener efecto, será obligatorio para el patrono conceder permiso a los trabajadores para tomar sus alimentos, sin alterar la marcha normal de las labores.
En las empresas que prestan un servicio público como las de ferrocarriles, de transporte de pasajeros, de suministro de energía eléctrica y otras análogas, el horario de trabajo será elaborado por la empresa, en atención al mejor servicio o a las disposiciones dictadas por la autoridad competente, según el caso, e incorporado al respectivo reglamento interno de trabajo.
Los trabajadores y los patronos no podrán pactar, en labores esenciales a la comunidad, horarios de trabajo que la perjudiquen. En esta clase de servicios, el horario de Trabajo deberá ser sometido a la aprobación del Director General de Trabajo.

### Art. 167.
Entre la terminación de una jornada, ordinaria o con adición de tiempo extraordinario, y la iniciación de la siguiente, deberá mediar un lapso no menor de ocho horas.

### Art. 168.
Las labores que se ejecuten en horas nocturnas se pagarán, por lo menos, con un veinticinco por ciento de recargo sobre el salario establecido para igual trabajo en horas diurnas.

### Art. 169.
Todo trabajo verificado en exceso de la jornada ordinaria, será remunerado con un recargo consistente en el ciento por ciento del salario básico por hora, hasta el límite legal.
Los trabajos que por fuerza mayor, como en caso de incendio, terremoto y otros semejantes, tuvieren que realizarse excediendo a la jornada ordinaria, se remunerarán solamente con salario básico.

### Art. 170.
El trabajo en horas extraordinarias sólo podrá pactarse en forma ocasional, cuando circunstancias imprevistas, especiales o necesarias así lo exijan.
Sin perjuicio de lo dispuesto en el inciso anterior, en las empresas en que se trabaje las veinticuatro horas del día, podrá estipularse el trabajo de una hora extraordinaria en forma permanente, para ser prestado en la jornada nocturna.
También podrá pactarse el trabajo de una hora extra diaria, para el solo efecto de reponer las cuatro horas del sexto día laboral, con el objeto de que los trabajadores puedan descansar, en forma consecutiva, los días sábados y domingo de cada semana.
En los casos a que se refieren los dos incisos anteriores, para que el acuerdo sea válido, será necesaria la aprobación del Director General de Trabajo.

---

## Algoritmo Hablado para IA Agente en Entornos CLI

Este algoritmo permite a una IA evaluar, validar y procesar una jornada diaria y acumulada semanal de un trabajador bajo la legislación salvadoreña.

### 1. Inicialización y Entrada de Datos
El agente CLI debe recibir como entrada los siguientes parámetros por cada día del ciclo de pago:
- `horas_trabajadas`: Lista de intervalos con `hora_inicio` y `hora_fin` (formato 24h).
- `salario_basico_diurno_hora`: Float.
- `es_tarea_peligrosa`: Booleano (indica si aplica el Artículo 162).
- `fuerza_mayor`: Booleano (si el exceso fue por emergencia imprevista como terremoto/incendio).
- `acumulado_horas_semana`: Entero/Float (historial de horas efectivas acumuladas en la semana actual).

### 2. Procesamiento Diario (Loop por Jornada)
Por cada intervalo trabajado en el día:
1. **Calcular la duración del intervalo** y acumular el total de horas del día.
2. **Clasificación de Horas (Diurnas vs. Nocturnas - Art. 161):**
   - Si la hora está entre las 06:00 y las 19:00, se contabiliza como `horas_diurnas_efectivas`.
   - Si la hora está entre las 19:00 y las 06:00 del día siguiente, se contabiliza como `horas_nocturnas_efectivas`.
3. **Determinación del Tipo de Jornada:**
   - Si `es_tarea_peligrosa` es falso:
     - Si `horas_nocturnas_efectivas` > 4, toda la jornada se evalúa con el límite nocturno (Límite Diario = 7h, Límite Semanal = 39h).
     - De lo contrario, se evalúa de forma mixta o diurna (Límite Diario = 8h, Límite Semanal = 44h).
   - Si `es_tarea_peligrosa` es verdadero (Art. 162):
     - Si `horas_nocturnas_efectivas` > 3.5, el Límite Diario = 6h y Límite Semanal = 36h.
     - De lo contrario, el Límite Diario = 7h y Límite Semanal = 39h.

### 3. Evaluación de Límites y Cálculo de Excesos (Horas Extras)
1. **Validar Descanso Interjornada (Art. 167):** El agente debe verificar si el delta entre la `hora_fin` del día anterior y la `hora_inicio` de hoy es menor a 8 horas. Si es menor, levantar una alerta/flag `CONTRADICCION_LEY_DESCANSO`.
2. **Cálculo de Horas Extraordinarias Diarias (Art. 169 y 170):**
   - `horas_exceso_dia` = `total_horas_dia` - `Limite_Diario`.
   - Si `horas_exceso_dia` > 0:
     - Si `fuerza_mayor` es Verdadero: Las horas extra se pagan con valor de hora básica normal (Recargo = 0%).
     - Si `fuerza_mayor` es Falso: Las horas extra se configuran con un Recargo del 100% (pago al doble).

### 4. Cálculo Económico y Aplicación de Recargos Nocturnos
1. **Aplicar Nocturnidad (Art. 168):** A todas las horas clasificadas como `horas_nocturnas_efectivas` (tanto ordinarias como extraordinarias), aplicarles de forma base un recargo del 25% sobre el valor equivalente de la hora diurna.
2. **Fórmula de Pago de Horas Extra Nocturnas:**
   - `valor_hora_nocturna` = `salario_basico_diurno_hora` * 1.25
   - `pago_extra_nocturno` = `horas_extra_nocturnas` * `valor_hora_nocturna` * 2.0 (por el 100% de recargo por extra).

### 5. Control de Cierre de Semana Laboral (Art. 161)
1. Sumar las horas ordinarias del día al `acumulado_horas_semana`.
2. Si el `acumulado_horas_semana` supera el límite semanal (44h, 39h o 36h según corresponda), cualquier hora posterior se procesará mandatoriamente como extraordinaria, aplicando el recargo del 100% según el Art. 169.
3. Emitir el output estructurado en formato JSON ideal para el pipeline del agente CLI.