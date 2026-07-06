// ============================================================
// Контент шпаргалки. Просто добавляй новые объекты в массивы —
// сайт подхватит их автоматически, ничего больше трогать не надо.
// Структура ответа: what (что это) -> key (ключевое отличие) -> example (пример/следствие)
// ============================================================

const CATEGORIES = [
  { id: "kotlin",      label: "Kotlin.kt",       icon: "K" },
  { id: "coroutines",  label: "Coroutines.kt",   icon: "C" },
  { id: "di",          label: "DI.kt",           icon: "D" },
  { id: "android",     label: "Android.kt",      icon: "A" },
  { id: "arch",        label: "Architecture.kt", icon: "Ar" },
  { id: "testing",     label: "Testing.kt",      icon: "T" },
  { id: "algo",        label: "Algorithms.kt",   icon: "Al" },
  { id: "lifehacks",   label: "Lifehacks.md",    icon: "L" },
  { id: "resume",      label: "Resume.md",       icon: "R" },
];

const QUESTIONS = [
  // ---------------- KOTLIN ----------------
  {
    id: "k1", cat: "kotlin", q: "Чем map отличается от mapTo?",
    what: "Обе функции трансформируют элементы коллекции, применяя переданную лямбду к каждому элементу.",
    key: "map создаёт новый список и возвращает его. mapTo принимает уже существующую коллекцию-приёмник (destination) и складывает результат туда же, возвращая эту же коллекцию.",
    example: "list.mapTo(mutableSetOf()) { it * 2 } — полезно, когда нужно сразу получить не List, а Set/другую коллекцию, без промежуточной аллокации.",
    code: `val src = listOf(1, 2, 3)

// map — создаёт новый List
val doubled: List<Int> = src.map { it * 2 }

// mapTo — пишет в переданную коллекцию
val doubledSet: MutableSet<Int> = src.mapTo(mutableSetOf()) { it * 2 }`
  },
  {
    id: "k2", cat: "kotlin", q: "Зачем нужен inline и что такое reified?",
    what: "inline указывает компилятору вставить тело функции прямо в место вызова вместо реального вызова функции.",
    key: "Главная причина использовать inline для функций высшего порядка — убрать накладные расходы на создание объекта-лямбды (каждая lambda в Kotlin по умолчанию компилируется в анонимный класс). reified работает только у inline-функций и позволяет обращаться к типу T в рантайме (T::class, is T) — обычные generic-параметры стираются (type erasure) и это невозможно.",
    example: "inline fun <reified T> Gson.fromJson(json: String): T = fromJson(json, T::class.java) — без reified пришлось бы отдельно передавать Class<T> аргументом.",
    code: `inline fun <reified T> parseJson(json: String): T {
    return Gson().fromJson(json, T::class.java)
}

// Использование — тип T известен в рантайме благодаря reified
val user: User = parseJson(jsonString)`
  },
  {
    id: "k3", cat: "kotlin", q: "Что такое variance (in/out) и что такое PECS?",
    what: "Variance описывает, как соотносятся Generic<A> и Generic<B>, если сам A является подтипом B.",
    key: "out (ковариантность) — тип используется только на выход (producer), можно присвоить List<Cat> переменной List<Animal>. in (контравариантность) — тип используется только на вход (consumer), например Comparator<Animal> можно использовать там, где ждут Comparator<Cat>. PECS — мнемоника из Java (Producer Extends, Consumer Super), в Kotlin: Producer — out, Consumer — in.",
    example: "interface Source<out T> { fun next(): T } — T только возвращается (produce), поэтому safe объявить out.",
    code: `interface Source<out T> { fun next(): T }

val strings: Source<String> = TODO()
val objects: Source<Any> = strings // OK благодаря out

interface Comparator2<in T> { fun compare(a: T, b: T): Int }
val anyComparator: Comparator2<Any> = TODO()
val stringComparator: Comparator2<String> = anyComparator // OK благодаря in`
  },

  // ---------------- COROUTINES ----------------
  {
    id: "c1", cat: "coroutines", q: "coroutineScope vs supervisorScope — в чём разница?",
    what: "Обе функции создают дочерний scope и приостанавливают выполнение, пока все запущенные внутри корутины не завершатся.",
    key: "В coroutineScope падение любой дочерней корутины отменяет весь scope и все остальные дочерние корутины (fail-fast, структурная конкурентность). В supervisorScope падение одного child не влияет на остальных — исключение просто пробрасывается наверх через try/catch вокруг конкретного child.",
    example: "supervisorScope удобен, когда запускаешь несколько независимых загрузок (грузим погоду + грузим избранное) и падение одной не должно убивать вторую.",
    code: `// coroutineScope: одна упала — все отменились
suspend fun loadAll() = coroutineScope {
    val a = async { loadWeather() }   // если упадёт —
    val b = async { loadFavourites() } // b тоже отменится
    a.await() to b.await()
}

// supervisorScope: независимые дети
suspend fun loadAllSafely() = supervisorScope {
    val a = async { runCatching { loadWeather() } }
    val b = async { runCatching { loadFavourites() } }
    a.await() to b.await()
}`
  },
  {
    id: "c2", cat: "coroutines", q: "Как распространяется исключение из async?",
    what: "async возвращает Deferred, а исключение из его тела не выбрасывается сразу — оно сохраняется внутри Deferred.",
    key: "Если ты не вызовешь .await(), исключение из async 'молчит' до тех пор, пока родительский scope не завершится (в обычном coroutineScope оно всё равно распространится наверх немедленно из-за структурной конкурентности; но в GlobalScope/отдельном Job — может потеряться, если await() не вызван).",
    example: "Частая ошибка — запустить несколько async в supervisorScope и забыть await() хотя бы один: исключение может 'потеряться' и приложение не покажет ошибку.",
    code: `supervisorScope {
    val deferred = async { throw RuntimeException("boom") }
    // Если не вызвать deferred.await() — исключение может быть проглочено
    delay(100)
} // рискованно без await()`
  },
  {
    id: "c3", cat: "coroutines", q: "callbackFlow — это hot или cold Flow?",
    what: "callbackFlow — билдер для превращения callback-based API (например, слушатель Location или SDK с колбэками) в Flow.",
    key: "Сам по себе Flow, возвращаемый из callbackFlow, cold: код внутри блока callbackFlow выполняется заново при каждой новой подписке (каждый collect создаёт новый callback-подписчик). Это отличает его от SharedFlow/StateFlow, которые hot и не пересоздают источник данных на каждую подписку.",
    example: "Если два коллектора подпишутся на Flow из callbackFlow — они получат два независимых callback-listener'а, а не один общий поток данных.",
    code: `fun locationFlow(client: LocationClient): Flow<Location> = callbackFlow {
    val callback = object : LocationCallback() {
        override fun onLocation(loc: Location) { trySend(loc) }
    }
    client.requestUpdates(callback)
    awaitClose { client.removeUpdates(callback) } // очистка при отмене
}`
  },
  {
    id: "c4", cat: "coroutines", q: "Что такое структурная конкурентность (structured concurrency)?",
    what: "Принцип, при котором у каждой запущенной корутины есть родительский Job, и время жизни child-корутины ограничено временем жизни родителя.",
    key: "Ключевое следствие: нельзя 'потерять' корутину — если отменяется родитель, автоматически отменяются все дети; если падает child без supervisor, падает и родитель. Это заменяет ручное управление потоками/callback'ами (где легко забыть отменить фоновую задачу).",
    example: "viewModelScope — пример структурной конкурентности в Android: при уничтожении ViewModel scope отменяется, и все запущенные в нём корутины автоматически cancel'ятся.",
    code: `class MyViewModel : ViewModel() {
    fun load() {
        viewModelScope.launch { // child привязан к жизни ViewModel
            repository.getData()
        }
    } // при onCleared() viewModelScope.cancel() вызывается автоматически
}`
  },

  // ---------------- DI ----------------
  {
    id: "d1", cat: "di", q: "@Binds vs @Provides — в чём разница и зачем нужны оба?",
    what: "Оба используются в Dagger/Hilt-модулях, чтобы сказать графу зависимостей, как создать экземпляр интерфейса или класса.",
    key: "@Provides — обычный метод, ты руками пишешь логику создания объекта (может понадобиться, если конструктор внешний, например Retrofit.Builder). @Binds — абстрактный метод без тела, просто говорит Dagger 'если кто-то просит интерфейс X, отдай ему реализацию Y' — Dagger генерирует связывание на этапе компиляции без лишнего кода, это быстрее и компактнее, чем писать @Provides вручную для тривиального связывания interface -> impl.",
    example: "Правило: если у тебя есть готовый конструктор класса-реализации — используй @Binds. Если объект нужно собрать вручную (билдеры, статические фабрики сторонних библиотек) — @Provides.",
    code: `@Module
@InstallIn(SingletonComponent::class)
abstract class RepoModule {
    @Binds
    abstract fun bindWeatherRepo(impl: WeatherRepositoryImpl): WeatherRepository
}

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    fun provideRetrofit(): Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .build()
}`
  },
  {
    id: "d2", cat: "di", q: "Lazy<T> vs Provider<T> в Dagger — зачем нужны?",
    what: "Оба — обёртки, которые Dagger умеет инжектить вместо самого объекта T, откладывая момент его создания.",
    key: "Lazy<T> создаёт объект один раз при первом вызове .get() и кеширует его (даже если сам binding не @Singleton). Provider<T> создаёт новый экземпляр при каждом вызове .get() — полезно для объектов, которые должны быть разными при каждом использовании (например, разные ViewHolder'ы).",
    example: "Lazy<ExpensiveObject> — если объект дорогой в создании и нужен не всегда (например, тяжёлый парсер, который используется в 1 из 10 сценариев экрана).",
    code: `class ReportScreen @Inject constructor(
    private val heavyParser: Lazy<HeavyPdfParser> // не создастся, пока не вызовем .get()
) {
    fun onExportClicked() {
        heavyParser.get().parse() // создаётся здесь, один раз
    }
}`
  },
  {
    id: "d3", cat: "di", q: "Зачем нужен @AssistedInject?",
    what: "Механизм Dagger/Hilt для случая, когда часть параметров конструктора должна приходить из графа DI, а часть — передаваться вручную в рантайме (например, id элемента, полученный от навигации).",
    key: "Обычный @Inject-конструктор не умеет принимать 'ручные' параметры, которые не являются частью графа зависимостей. @AssistedInject решает это: часть параметров помечается @Assisted и передаётся через сгенерированную Factory, остальное Dagger подставляет сам.",
    example: "ViewModel, которому нужен itemId из аргументов навигации, но также нужен Repository из графа DI — классический кейс для @AssistedInject.",
    code: `class DetailViewModel @AssistedInject constructor(
    @Assisted private val itemId: String,
    private val repository: WeatherRepository // из графа DI
) : ViewModel() {

    @AssistedFactory
    interface Factory {
        fun create(itemId: String): DetailViewModel
    }
}`
  },

  // ---------------- ANDROID ----------------
  {
    id: "a1", cat: "android", q: "Как Handler может привести к утечке памяти в Activity?",
    what: "Handler, созданный как non-static inner class внутри Activity, неявно хранит ссылку на внешний класс (this@Activity) через синтетическое поле this$0.",
    key: "Если Handler используется для отложенного сообщения (postDelayed) и Activity уничтожается до того, как сообщение обработано, Message в очереди MessageQueue продолжает держать ссылку на Handler -> Handler держит ссылку на Activity -> GC не может собрать Activity, пока очередь не разгребётся или процесс не убьют. Решение: static class + WeakReference<Activity>, либо отменять сообщения в onDestroy (removeCallbacksAndMessages).",
    example: "postDelayed на 30 секунд + пользователь быстро закрыл экран — Activity 'подвисает' в памяти ещё 30 секунд как минимум.",
    code: `// Плохо: implicit ссылка на Activity
class MainActivity : AppCompatActivity() {
    private val handler = Handler(Looper.getMainLooper())
    // handler.postDelayed({ ... }, 30_000) — держит this@MainActivity
}

// Хорошо: WeakReference + static-подобный класс
class SafeHandler(activity: MainActivity) : Handler(Looper.getMainLooper()) {
    private val ref = WeakReference(activity)
    override fun handleMessage(msg: Message) {
        ref.get()?.let { /* безопасно, может быть null */ }
    }
}
// + в onDestroy(): handler.removeCallbacksAndMessages(null)`
  },
  {
    id: "a2", cat: "android", q: "Room: @Embedded, @ForeignKey, @Relation — зачем каждая нужна?",
    what: "Три разные аннотации Room для работы со связанными данными между таблицами/объектами.",
    key: "@Embedded — 'разворачивает' поля вложенного объекта прямо в колонки той же таблицы (просто композиция данных, никакой связи между таблицами). @ForeignKey — реальное ограничение целостности на уровне SQLite между двумя таблицами (например, CASCADE при удалении родителя). @Relation — говорит Room, как собрать граф объектов out-of-the-box при чтении (one-to-many), генерируя дополнительный запрос под капотом.",
    example: "@Embedded — Address внутри User в одной таблице users. @ForeignKey + @Relation — City как отдельная таблица, где у User есть cityId, и Room сам подтянет список City при запросе.",
    code: `data class User(
    @Embedded val address: Address, // разворачивается в колонки таблицы users
    val cityId: Long
)

@Entity(
    foreignKeys = [ForeignKey(
        entity = City::class,
        parentColumns = ["id"], childColumns = ["cityId"],
        onDelete = ForeignKey.CASCADE
    )]
)
data class UserEntity(val cityId: Long, /* ... */)

data class UserWithCity(
    @Embedded val user: UserEntity,
    @Relation(parentColumn = "cityId", entityColumn = "id")
    val city: City
)`
  },
  {
    id: "a3", cat: "android", q: "Как работает DiffUtil и зачем он нужен?",
    what: "DiffUtil — утилита, которая сравнивает два списка (старый и новый) и вычисляет минимальный набор операций (insert/remove/move/change), чтобы обновить RecyclerView.",
    key: "Под капотом используется алгоритм на основе longest common subsequence (по сути вариация алгоритма Майерса), работающий за O(N + D²) в среднем, где D — количество различий. Ключевое отличие от notifyDataSetChanged() — DiffUtil даёт точечные анимации обновления вместо полной перерисовки списка, и не сбрасывает scroll-позицию.",
    example: "ListAdapter<T, VH> уже использует AsyncListDiffer (DiffUtil на фоновом потоке) под капотом, поэтому в 95% случаев не нужно вызывать DiffUtil.calculateDiff() руками.",
    code: `class ItemDiffCallback : DiffUtil.ItemCallback<Item>() {
    override fun areItemsTheSame(old: Item, new: Item) = old.id == new.id
    override fun areContentsTheSame(old: Item, new: Item) = old == new // data class
}

class ItemAdapter : ListAdapter<Item, ItemViewHolder>(ItemDiffCallback()) {
    // submitList() сам считает diff в фоне и анимирует изменения
}`
  },

  // ---------------- ARCHITECTURE ----------------
  {
    id: "ar1", cat: "arch", q: "MVVM vs MVI — в чём принципиальная разница?",
    what: "Оба паттерна разделяют UI (View) и логику (ViewModel/Model), но по-разному описывают, как View получает и меняет состояние.",
    key: "В MVVM у ViewModel обычно много независимых LiveData/StateFlow полей (isLoading, error, data...), и View сама комбинирует их. В MVI — одно неделимое State (Reducer собирает предыдущий State + Event/Intent -> новый State), поток данных строго однонаправленный (Unidirectional Data Flow): Intent -> Reducer -> State -> View -> новый Intent. MVI жёстче ограничивает, где меняется состояние, что упрощает отладку сложных экранов, но добавляет boilerplate для простых.",
    example: "Реальный признак MVI в коде — sealed class Event/Intent и единственный StateFlow<State>, а не россыпь отдельных полей.",
    code: `// MVI: единое состояние + Reducer
data class ScreenState(val isLoading: Boolean = false, val items: List<Item> = emptyList())
sealed interface ScreenEvent { data object Refresh : ScreenEvent }

class ScreenViewModel : ViewModel() {
    private val _state = MutableStateFlow(ScreenState())
    val state = _state.asStateFlow()

    fun onEvent(event: ScreenEvent) = when (event) {
        is ScreenEvent.Refresh -> reduce { it.copy(isLoading = true) }
    }
    private fun reduce(block: (ScreenState) -> ScreenState) { _state.update(block) }
}`
  },
  {
    id: "ar2", cat: "arch", q: "Правило зависимостей в Clean Architecture — как объяснить просто?",
    what: "Приложение делится на слои (Presentation -> Domain -> Data), и зависимости кода могут указывать только 'внутрь', к Domain.",
    key: "Domain-слой (Entities, UseCases, интерфейсы Repository) не должен знать вообще ничего ни про Android SDK, ни про конкретную БД/сеть — он чистый Kotlin. Data-слой реализует интерфейсы из Domain (Dependency Inversion, D из SOLID), а не наоборот. Это позволяет подменить источник данных (Room -> SQLDelight) не трогая бизнес-логику.",
    example: "Если в UseCase импортируется android.content.Context — это нарушение правила зависимостей, тревожный звоночек на собеседовании.",
    code: `// domain — чистый Kotlin, никакого Android
interface WeatherRepository { suspend fun getWeather(city: String): Weather }
class GetWeatherUseCase(private val repo: WeatherRepository) {
    suspend operator fun invoke(city: String) = repo.getWeather(city)
}

// data — реализует интерфейс из domain (Dependency Inversion)
class WeatherRepositoryImpl(private val api: WeatherApi) : WeatherRepository {
    override suspend fun getWeather(city: String) = api.fetch(city).toDomain()
}`
  },

  // ---------------- TESTING (пробелы — учить с нуля) ----------------
  {
    id: "t1", cat: "testing", q: "runTest и StandardTestDispatcher — зачем и как связаны с корутинами?",
    what: "runTest — билдер для тестирования suspend-функций, который выполняет корутину в контролируемом виртуальном времени.",
    key: "Ключевая проблема без runTest: delay(10_000) в тесте реально ждал бы 10 секунд. runTest автоматически пропускает delay, продвигая виртуальное время мгновенно. StandardTestDispatcher — диспетчер по умолчанию внутри runTest, который не начинает корутину сразу при launch, а ставит её в очередь — нужно вызвать advanceUntilIdle() / runCurrent(), чтобы она реально выполнилась (это специально, чтобы тест мог проверить промежуточное состояние ДО завершения корутины).",
    example: "Если тест 'зависает' без ошибки — почти всегда забыт advanceUntilIdle() или используется реальный Dispatchers.IO вместо inject-нутого тестового диспетчера.",
    code: `@Test
fun \`loading state shows before data\`() = runTest {
    val viewModel = MyViewModel(fakeRepo, StandardTestDispatcher(testScheduler))
    viewModel.load()
    assertEquals(true, viewModel.state.value.isLoading) // до advance — ещё грузится
    advanceUntilIdle()
    assertEquals(false, viewModel.state.value.isLoading) // после — уже готово
}`
  },
  {
    id: "t2", cat: "testing", q: "Turbine — зачем он нужен, если можно просто собрать Flow в список?",
    what: "Turbine — библиотека для тестирования Flow, дающая явный API для 'ожидания' следующих эмиссий вместо ручного toList().",
    key: "Проблема toList() на 'бесконечном' Flow (например, StateFlow) — тест никогда не завершится, потому что Flow не закрывается сам. Turbine даёт test { }-блок с awaitItem() / awaitComplete() / awaitError(), где ты явно говоришь, сколько элементов ждать, и точно ловишь неожиданные лишние эмиссии как ошибку теста.",
    example: "viewModel.state.test { assertEquals(loadingState, awaitItem()); assertEquals(successState, awaitItem()) } — тест явно проверяет последовательность состояний, а не просто финальный результат.",
    code: `@Test
fun \`emits loading then success\`() = runTest {
    viewModel.state.test {
        assertEquals(ScreenState(isLoading = false), awaitItem()) // начальное
        viewModel.onEvent(ScreenEvent.Refresh)
        assertEquals(ScreenState(isLoading = true), awaitItem())
        assertEquals(ScreenState(isLoading = false, items = fakeItems), awaitItem())
        cancelAndIgnoreRemainingEvents()
    }
}`
  },
  {
    id: "t3", cat: "testing", q: "Mockito: mock() vs verify() vs when() — базовая механика",
    what: "Mockito — библиотека для создания фейковых реализаций (mock) зависимостей, чтобы тестировать класс изолированно от его реальных коллабораторов.",
    key: "mock() создаёт объект-заглушку, все методы которого по умолчанию 'ничего не делают' (возвращают null/0/false). whenever(...).thenReturn(...) настраивает, что мок должен вернуть на конкретный вызов (стаб). verify(mock).method() проверяет постфактум, что метод действительно был вызван — это отдельная задача от стаба, стаб отвечает 'что вернуть', verify — 'было ли обращение'.",
    example: "Частая путаница на собесе: verify не настраивает поведение, а только проверяет факт вызова — это два разных этапа теста (Arrange/stub -> Act -> Assert/verify).",
    code: `@Test
fun \`loads weather from repository\`() = runTest {
    val repo = mock<WeatherRepository>()
    whenever(repo.getWeather("Rostov")).thenReturn(fakeWeather)

    val useCase = GetWeatherUseCase(repo)
    val result = useCase("Rostov")

    assertEquals(fakeWeather, result)
    verify(repo).getWeather("Rostov") // проверяем, что вызов реально был
}`
  },

  // ---------------- ALGORITHMS (пробел — критично для Тинькофф/Озон) ----------------
  {
    id: "al1", cat: "algo", q: "Как вообще подступиться к алгоритмам, если начинаю с нуля?",
    what: "Для Middle Android чаще всего спрашивают не олимпиадные задачи, а базовые структуры данных + типовые паттерны (two pointers, sliding window, DFS/BFS на дереве/графе, простая динамика).",
    key: "Приоритет для тебя (учитывая, что это критичный пробел): 1) Массивы/строки — two pointers, sliding window. 2) HashMap-based задачи (у тебя уже сильное понимание HashMap внутри — используй это). 3) Деревья/графы — обход DFS/BFS (пригодится и для понимания Compose recomposition tree, кстати). 4) Базовая DP (Fibonacci-подобные, знакомые паттерны).",
    example: "LeetCode Easy/Medium с тегами 'Array', 'Hash Table', 'Two Pointers', 'Tree' — закрывают большую часть реальных собесов уровня Middle в Т-Банк/Авито.",
    code: `// Пример на разминку: Two Sum через HashMap — O(n) вместо O(n^2)
fun twoSum(nums: IntArray, target: Int): IntArray {
    val seen = HashMap<Int, Int>() // значение -> индекс
    nums.forEachIndexed { i, n ->
        val need = target - n
        seen[need]?.let { return intArrayOf(it, i) }
        seen[n] = i
    }
    return intArrayOf()
}`
  },

  // ---------------- LIFEHACKS ----------------
  {
    id: "l1", cat: "lifehacks", q: "Структура ответа на любой теоретический вопрос",
    what: "Твоя рабочая формула, которая уже подтверждена на реальных мок-собесах: 'что это -> ключевое отличие -> пример/следствие'.",
    key: "Она решает твою главную повторяющуюся проблему — правильная интуиция, но неточная терминология и слабое механистическое объяснение 'как это работает под капотом'. Формула заставляет сначала явно определить понятие, потом назвать РОВНО то отличие, которое отвечает на вопрос, и только потом иллюстрировать кодом.",
    example: "Плохо: 'ну, coroutineScope и supervisorScope они типа похожи, просто в одном по-другому исключения'. Хорошо: 'Это builder'ы для structured concurrency. Отличие — в coroutineScope падение любого child отменяет всех, в supervisorScope — нет. Пример: supervisorScope для независимых параллельных загрузок'.",
    code: null
  },
  {
    id: "l2", cat: "lifehacks", q: "Что делать, если вопрос неизвестен вообще",
    what: "Интервьюер видит по глазам, когда ты придумываешь на ходу — это выглядит хуже, чем честное 'не знаю, но вот как бы я стал разбираться'.",
    key: "Формула: 1) честно скажи, что не сталкивался конкретно с этим; 2) назови ближайшее знакомое понятие и предположи логическую связь ('это похоже на X, значит, вероятно...'); 3) скажи, где бы посмотрел (документация, исходники). Это показывает инженерное мышление даже без готового ответа.",
    example: "'С @AssistedFactory руками не работал, но по названию похоже на паттерн Factory поверх обычного DI — предположу, что он нужен для параметров, которые нельзя достать из графа. Проверил бы в официальной доке Dagger по Assisted Injection.'",
    code: null
  },
  {
    id: "l3", cat: "lifehacks", q: "Формат system design интервью для мобильной разработки",
    what: "В отличие от backend system design, мобильный system design почти никогда не про масштабирование серверов — он про архитектуру конкретного экрана/фичи на клиенте.",
    key: "Стандартная структура интервью: 1) Requirements gathering — задай уточняющие вопросы (offline-режим нужен? real-time обновления? какая нагрузка на UI список — 10 или 10000 элементов?). 2) High-level architecture — слои (Presentation/Domain/Data), выбор источников данных (кэш + сеть), стратегия синхронизации. 3) Deep dive в 1-2 компонента по запросу интервьюера (например, 'как именно сделаешь offline-first кэш?').",
    example: "Не спеши сразу рисовать слои — 2 минуты на уточняющие вопросы почти всегда поднимают твою оценку сильнее, чем красивая диаграмма без контекста требований.",
    code: null
  },
  {
    id: "l4", cat: "lifehacks", q: "Как использовать footnote-подход для терминов на собесе",
    what: "Если используешь корпоративный/жаргонный термин ('boilerplate', 'race condition', 'backpressure') — сразу поясни его одним словом, не жди вопроса.",
    key: "Это показывает, что ты понимаешь термин, а не просто запомнил слово. Заодно снижает риск, что интервьюер решит, будто ты используешь buzzword без понимания.",
    example: "'Тут будет race condition — то есть непредсказуемый результат из-за одновременного доступа к общим данным из разных потоков' — одна короткая вставка, без лекции.",
    code: null
  },

  // ---------------- RESUME ----------------
  {
    id: "r1", cat: "resume", q: "Структура резюме на Middle Android",
    what: "Резюме должно за 6-10 секунд первого просмотра ответить рекрутеру на вопрос 'подходит ли этот человек по стеку и уровню'.",
    key: "Рабочий порядок блоков: 1) Заголовок с ролью и ключевым стеком (Android Developer | Kotlin, Compose, Coroutines). 2) Опыт работы — с конкретными технологиями и результатами (не просто 'участвовал в разработке', а что именно сделал). 3) Pet-проект как отдельный сильный пункт, если в опыте пока мало 'взрослых' задач. 4) Стек технологий отдельным блоком для быстрого сканирования ATS/рекрутером. 5) Образование — коротко, не в начале, если оно не в IT.",
    example: "У тебя: Wildberries в опыте + WeatherApp как pet-проект с Clean Architecture/MVVM/MVI/Hilt/Compose — это ровно тот 'сильный pet-проект компенсирует небольшой формальный опыт' паттерн, который стоит явно показать.",
    code: null
  },
  {
    id: "r2", cat: "resume", q: "Как описывать pet-проект (WeatherApp), чтобы это выглядело серьёзно",
    what: "Разница между 'сделал приложение погоды' и описанием, которое реально впечатляет — в конкретике архитектурных решений и обоснований.",
    key: "Формула для пункта: технология/решение -> зачем именно так (что это даёт) -> конкретный элемент, который можно спросить на собесе. Не перечисляй технологии списком без контекста — каждая должна быть 'подсказкой' для интервьюера, о чём тебя можно расспросить (и ты правда должен быть готов рассказать детали).",
    example: "'Реализовал MVI с State/Event/Effect на 3 экранах (Favourites/Search/Detail) — однонаправленный поток данных упростил тестирование и отладку по сравнению с россыпью LiveData полей' звучит сильнее, чем просто 'использовал MVI'.",
    code: null
  },
  {
    id: "r3", cat: "resume", q: "Сопроводительное письмо — нужно ли и что писать",
    what: "Для Middle-позиций в крупных компаниях (Т-Банк, Яндекс, Авито) сопроводительное не всегда обязательно, но резко выделяет резюме среди потока откликов.",
    key: "Хорошее сопроводительное — не пересказ резюме, а 3-4 предложения: почему именно эта компания/команда, какой конкретно опыт из твоего бэкграунда релевантен именно этой вакансии (не общими словами), готовность к формату (например, к тестовому заданию).",
    example: "Упоминание конкретной технологии из вакансии, которая у тебя есть ('вижу, что у вас в стеке Compose Multiplatform — у меня есть опыт с Compose в WeatherApp') работает сильнее общих фраз про 'быстро обучаюсь и мотивирован'.",
    code: null
  },
];
