// ============================================================
// Контент шпаргалки. Просто добавляй новые объекты в массивы —
// сайт подхватит их автоматически, ничего больше трогать не надо.
// Структура ответа: what (что это) -> key (ключевое отличие) -> example (пример/следствие)
// ============================================================

const CATEGORIES = [
  { id: "kotlin",      label: "Kotlin.kt",       icon: "K" },
  { id: "java",        label: "Java.java",       icon: "J" },
  { id: "android",     label: "AndroidSDK.kt",   icon: "A" },
  { id: "viewxml",     label: "ViewXML.kt",      icon: "Vx" },
  { id: "compose",     label: "Compose.kt",      icon: "Cp" },
  { id: "coroutines",  label: "Coroutines.kt",   icon: "Co" },
  { id: "flow",        label: "Flow.kt",         icon: "Fl" },
  { id: "concurrency", label: "Concurrency.kt",  icon: "Cc" },
  { id: "di",          label: "Dagger.kt",       icon: "D" },
  { id: "hilt",        label: "Hilt.kt",         icon: "H" },
  { id: "patterns",    label: "Patterns.kt",     icon: "P" },
  { id: "arch",        label: "ArchPatterns.kt", icon: "Ar" },
  { id: "cleancode",   label: "CleanCode.kt",    icon: "Cl" },
  { id: "algo",        label: "Algorithms.kt",   icon: "Al" },
  { id: "room",        label: "Room.kt",         icon: "Rm" },
  { id: "retrofit",    label: "Retrofit.kt",     icon: "Rt" },
  { id: "git",         label: "Git.sh",          icon: "G" },
  { id: "testing",     label: "Testing.kt",      icon: "T" },
  { id: "sysdesign",   label: "SystemDesign.md", icon: "Sd" },
  { id: "rxjava",      label: "RxJava.kt",       icon: "Rx" },
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

  // ---------------- JAVA ----------------
  {
    id: "j1", cat: "java", q: "Что такое GC Roots и типы ссылок (Strong/Soft/Weak/Phantom)?",
    what: "GC Roots — это 'точки отсчёта', от которых сборщик мусора (Garbage Collector) строит граф достижимых объектов: статические поля, локальные переменные активных потоков, JNI-ссылки.",
    key: "Объект жив, пока до него есть путь от GC Root по строгим (Strong) ссылкам. Soft-ссылки удаляются только при угрозе OutOfMemory. Weak-ссылки удаляются при любом проходе GC (пример: WeakReference на Activity в Handler). Phantom-ссылки нужны только чтобы узнать момент фактического удаления объекта из памяти (для точной очистки внешних ресурсов), сам объект через них даже прочитать нельзя.",
    example: "Циклическая ссылка (A хранит B, B хранит A) не мешает GC — если ни на A, ни на B нет пути от GC Root, весь цикл соберётся целиком, в отличие от простого reference counting.",
    code: `class Cache {
    // Soft — удалится сборщиком только при риске OOM, подходит для кэша
    private val cache = HashMap<String, SoftReference<Bitmap>>()

    // Weak — удалится при любой сборке мусора, подходит для утечкоопасных ссылок
    private val listeners = mutableListOf<WeakReference<Listener>>()
}`
  },
  {
    id: "j2", cat: "java", q: "Контракт equals() и hashCode() — почему нельзя переопределить только один?",
    what: "equals() определяет логическое равенство объектов, hashCode() — число для быстрого распределения объекта по 'корзинам' (bucket) в хэш-коллекциях (HashMap, HashSet).",
    key: "Контракт: если a.equals(b) == true, то ОБЯЗАТЕЛЬНО a.hashCode() == b.hashCode(). Обратное не гарантируется (коллизии допустимы). Если переопределить только equals — два 'равных' объекта могут попасть в разные bucket'ы, и HashMap.get() их не найдёт, потому что сначала ищет bucket по hashCode, и только потом сверяет через equals внутри него.",
    example: "data class в Kotlin решает это автоматически, генерируя согласованную пару equals/hashCode — частая ошибка на собесе объяснить это без слова 'контракт'.",
    code: `class BadKey(val id: Int) {
    override fun equals(other: Any?) = other is BadKey && other.id == id
    // hashCode НЕ переопределён — использует адрес объекта по умолчанию!
}

val map = HashMap<BadKey, String>()
map[BadKey(1)] = "value"
map[BadKey(1)] // null! Разные hashCode -> разные bucket'ы -> equals даже не проверяется`
  },
  {
    id: "j3", cat: "java", q: "Почему в Kotlin нет checked exceptions, как в Java?",
    what: "В Java checked exceptions (например, IOException) компилятор заставляет либо ловить, либо явно указывать в сигнатуре метода (throws). В Kotlin такого разделения нет — все исключения unchecked.",
    key: "Плюс: не нужно засорять сигнатуры try/catch ради компилятора там, где реальной обработки нет (частая практика в Java — пустой catch, лишь бы скомпилировалось). Минус: компилятор больше не подскажет, что функция может бросить исключение — приходится либо читать документацию/тело, либо закладывать явную обработку через типы (sealed class Result<T>) вместо exceptions.",
    example: "Современный подход в Kotlin — вместо exceptions для ожидаемых ошибок (нет сети, невалидные данные) использовать sealed-иерархию Result/Success/Error, оставляя exceptions только для реально исключительных ситуаций.",
    code: `sealed interface ApiResult<out T> {
    data class Success<T>(val data: T): ApiResult<T>
    data class Error(val message: String): ApiResult<Nothing>
}
// Явно видно из сигнатуры, что может пойти не так — без throws в стиле Java`
  },

  // ---------------- ANDROID SDK (доп.) ----------------
  {
    id: "a4", cat: "android", q: "Почему у Bundle есть лимит на объём передаваемых данных (~1-2 МБ)?",
    what: "Bundle используется не только внутри одного процесса — при передаче данных между Activity/процессами (и даже просто при пересоздании Activity системой) он сериализуется через транзакцию Binder — механизм межпроцессного взаимодействия (IPC) в Android.",
    key: "У Binder-транзакций есть фиксированный буфер (около 1 МБ на процесс, точное число варьируется по версии Android), которым делятся ВСЕ одновременные транзакции приложения. Превышение лимита выбрасывает TransactionTooLargeException. Это ограничение самого механизма IPC, а не 'жадности' Bundle.",
    example: "Частая ошибка — передавать Bitmap напрямую через Intent extras: даже одна фотография с камеры легко превышает лимит. Правильно — сохранить во временный файл и передать Uri.",
    code: `// Плохо: может упасть с TransactionTooLargeException
intent.putExtra("photo", bitmap)

// Хорошо: передаём ссылку на файл, а не сами данные
val uri = saveBitmapToCache(bitmap)
intent.putExtra("photoUri", uri)`
  },
  {
    id: "a5", cat: "android", q: "Чем отличаются launchMode: standard, singleTop, singleTask, singleInstance?",
    what: "launchMode в манифесте управляет тем, как система создаёт новый экземпляр Activity и куда помещает его в стеке задач (back stack), когда её запускают через Intent.",
    key: "standard — всегда создаёт новый экземпляр, даже поверх такого же. singleTop — не создаёт новый, если та же Activity уже на вершине стека (просто вызывает onNewIntent). singleTask — Activity существует в единственном экземпляре в рамках задачи, все Activity над ней в стеке уничтожаются при повторном открытии. singleInstance — как singleTask, но Activity живёт в отдельной, изолированной задаче, куда не может попасть никакая другая Activity.",
    example: "singleTop типично используют для экрана поиска (повторный тап на уведомление с тем же контентом не должен плодить дубли экрана), singleTask — для точки входа вроде главного экрана.",
    code: null
  },
  {
    id: "a6", cat: "android", q: "Как система решает, какое приложение убить первым при нехватке памяти?",
    what: "Android использует систему приоритетов процессов (process importance hierarchy) — чем 'важнее' процесс для пользователя прямо сейчас, тем позже его убьют при нехватке памяти (Low Memory Killer).",
    key: "Порядок примерно такой (от самого защищённого к самому уязвимому): Foreground process (видимая Activity/Foreground Service) → Visible process (частично видимый, например за диалогом) → Service process → Background process (свёрнутое приложение) → Empty process. Foreground Service поднимает приоритет процесса именно потому, что переводит его в защищённую категорию.",
    example: "Именно поэтому для геолокации в реальном времени (такси, доставка) используют Foreground Service с уведомлением — обычный Background Service система может убить в любой момент.",
    code: null
  },

  // ---------------- ВЬЮ XML ----------------
  {
    id: "vx1", cat: "viewxml", q: "Как обновить только один элемент списка (например, чекбокс), не перерисовывая весь item?",
    what: "DiffUtil по умолчанию сравнивает старый и новый item целиком и решает — перерисовать весь item или нет. Payloads — механизм частичного обновления, когда меняется только часть данных внутри item.",
    key: "Если areContentsTheSame() возвращает false, DiffUtil может передать в getChangePayload() конкретный объект-подсказку (например, строку 'checkbox_changed'). В onBindViewHolder с параметром payloads адаптер проверяет: если payload не пуст — обновляет только нужное View (checkbox.isChecked = ...) без пересоздания и переизмерения всего item.",
    example: "Без Payloads: изменение одного чекбокса в списке банковских карт перерисовывает всю сложную вёрстку item (иконки, текст, тени) — заметное проседание FPS на длинных списках.",
    code: `override fun onBindViewHolder(holder: VH, position: Int, payloads: List<Any>) {
    if (payloads.isNotEmpty() && payloads[0] == "checkbox_changed") {
        holder.checkbox.isChecked = getItem(position).isChecked
        return // не трогаем остальные вьюхи item'а
    }
    super.onBindViewHolder(holder, position, payloads)
}`
  },
  {
    id: "vx2", cat: "viewxml", q: "invalidate() vs requestLayout() — в чём разница?",
    what: "Обе функции просят View обновиться, но запускают разные части цикла отрисовки (Measure → Layout → Draw).",
    key: "invalidate() помечает View 'грязной' и запускает только повторный onDraw() — используется, когда изменился визуальный контент, но не размер/позиция (например, цвет фона). requestLayout() запускает полный цикл заново — onMeasure() и onLayout(), а затем обычно и onDraw() — нужен, когда изменился размер или положение View.",
    example: "Важный нюанс с собеса: вызов invalidate() НЕ гарантирует немедленный вызов onDraw() — система может батчить несколько invalidate() в один кадр отрисовки.",
    code: `// Изменился только цвет — достаточно invalidate()
fun setHighlightColor(color: Int) {
    this.color = color
    invalidate() // просит только перерисовать
}

// Изменился текст, который может повлиять на размер — нужен requestLayout()
fun setText(text: String) {
    this.text = text
    requestLayout() // просит пересчитать размер и позицию заново
}`
  },
  {
    id: "vx3", cat: "viewxml", q: "Почему ViewBinding нужно обнулять в onDestroyView() у Fragment, а у Activity — нет?",
    what: "ViewBinding хранит ссылки на все View конкретной иерархии разметки (inflated View hierarchy).",
    key: "У Fragment есть два разных жизненных цикла: жизненный цикл самого Fragment-объекта и жизненный цикл его View (View lifecycle) — View может быть уничтожена (onDestroyView) и создана заново (например, при возврате из backstack), пока сам Fragment остаётся жив в памяти. Если не обнулить binding в onDestroyView, он продолжает держать ссылку на уже уничтоженную иерархию View — это утечка памяти. У Activity View и сама Activity уничтожаются одновременно, поэтому отдельно обнулять нечего.",
    example: "Частый паттерн — nullable backing property (_binding) + non-null геттер (binding), который бросает исключение при обращении вне жизненного цикла View.",
    code: `private var _binding: FragmentDetailBinding? = null
private val binding get() = _binding!!

override fun onDestroyView() {
    super.onDestroyView()
    _binding = null // разрываем ссылку на уничтоженную View-иерархию
}`
  },

  // ---------------- COMPOSE ----------------
  {
    id: "cx1", cat: "compose", q: "LaunchedEffect vs DisposableEffect vs SideEffect — когда что использовать?",
    what: "Все три — side-effect API в Compose для выполнения кода вне обычного процесса рекомпозиции (recomposition — процесс пересчёта UI при изменении State).",
    key: "LaunchedEffect(key) — запускает suspend-корутину при входе в композицию или при смене key, отменяет её при выходе. DisposableEffect(key) — для эффектов, которым нужна явная очистка (отписка от слушателя) через блок onDispose, не связан с корутинами. SideEffect — выполняется при КАЖДОЙ успешной рекомпозиции, без привязки к ключам и без возможности отмены — обычно для синхронизации Compose-состояния с не-Compose кодом (аналитика, старый View-based SDK).",
    example: "Задача 'отследить момент появления баннера на экране для метрики' — это DisposableEffect (нужен onDispose при исчезновении), а 'загрузить данные при открытии экрана' — LaunchedEffect(Unit).",
    code: `// Запуск и отмена корутины
LaunchedEffect(userId) {
    viewModel.loadUser(userId)
}

// Подписка + обязательная очистка
DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event -> /* ... */ }
    lifecycleOwner.lifecycle.addObserver(observer)
    onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
}`
  },
  {
    id: "cx2", cat: "compose", q: "Что такое стабильность типов в Compose (@Stable/@Immutable) и почему List — нестабильный тип?",
    what: "Compose пропускает рекомпозицию Composable-функции, если все её параметры 'стабильны' и не изменились между вызовами. Стабильность — это гарантия компилятору, что при equals()==true визуальное представление объекта не изменилось.",
    key: "List — это интерфейс в Kotlin, и Compose не может гарантировать, что конкретная реализация за ним иммутабельна (кто-то может передать MutableList и незаметно поменять его содержимое без пересоздания ссылки) — поэтому компилятор Compose считает List нестабильным и на всякий случай перезапускает рекомпозицию при каждом изменении состояния родителя, даже если сам список не менялся. Аннотации @Immutable/@Stable — явное обещание разработчика компилятору, что тип ведёт себя стабильно.",
    example: "Решения: обернуть список в @Immutable data class-обёртку, использовать kotlinx.collections.immutable (ImmutableList), либо настроить Stability Configuration File для сторонних классов, которые нельзя аннотировать напрямую.",
    code: `@Immutable
data class UiState(val items: List<Item>) // явно говорим Compose: доверяй этому классу

@Composable
fun ItemList(state: UiState) {
    // Compose теперь может пропускать лишние рекомпозиции для state.items
}`
  },
  {
    id: "cx3", cat: "compose", q: "Зачем нужен derivedStateOf?",
    what: "derivedStateOf создаёт State, значение которого вычисляется из других State, но рекомпозиция триггерится только когда РЕЗУЛЬТАТ вычисления реально изменился — а не каждый раз, когда меняется исходное состояние.",
    key: "Без derivedStateOf: если завязать Composable на 'сырое' состояние скролла (например, firstVisibleItemIndex, которое меняется на каждый пиксель), рекомпозиция будет происходить сотни раз за один жест скролла. derivedStateOf пересчитывает производное значение (например, 'показывать кнопку scroll-to-top: true/false') и триггерит рекомпозицию только когда именно это булево значение меняется.",
    example: "Классический пример — показ FAB 'наверх' в списке: сырой индекс скролла меняется постоянно, а булево 'показывать/скрывать кнопку' — редко.",
    code: `val showButton by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 0 }
} // Рекомпозиция только когда showButton реально меняет значение true/false`
  },

  // ---------------- FLOW ----------------
  {
    id: "fl1", cat: "flow", q: "StateFlow vs SharedFlow — в чём разница и когда каждый может 'подвести'?",
    what: "Оба — горячие (hot) реализации Flow: существуют независимо от подписчиков и не пересоздают источник данных на каждую подписку.",
    key: "StateFlow всегда хранит РОВНО одно последнее значение (обязателен initial value) и отдаёт его немедленно каждому новому подписчику — по сути, реактивный аналог переменной. SharedFlow гибче: можно настроить replay (сколько последних значений отдавать новому подписчику, по умолчанию 0) и не требует начального значения — подходит для одноразовых событий (показать Toast, навигация), которые не должны 'залипать' как состояние.",
    example: "Классическая ловушка с собеса: если хранить событие 'показать Alert' в StateFlow, при повороте экрана (пересоздании подписчика) Alert покажется повторно, потому что StateFlow отдаёт своё последнее значение заново. Для одноразовых событий правильнее SharedFlow с replay = 0.",
    code: `// StateFlow — для состояния экрана (нужно последнее значение всегда)
val uiState: StateFlow<ScreenState> = _uiState.asStateFlow()

// SharedFlow с replay=0 — для одноразовых событий (навигация, снекбар)
private val _events = MutableSharedFlow<UiEvent>(replay = 0)
val events = _events.asSharedFlow()`
  },
  {
    id: "fl2", cat: "flow", q: "Чем flowOn концептуально отличается от observeOn в RxJava?",
    what: "Оба меняют диспетчер/поток выполнения для цепочки операций, но действуют в разных направлениях относительно места вызова.",
    key: "observeOn в RxJava меняет поток для ВСЕХ операторов НИЖЕ по цепочке (после вызова). flowOn в Kotlin Flow работает наоборот — меняет диспетчер для операторов ВЫШЕ по цепочке (до места вызова flowOn), а всё что идёт после него (включая collect) выполняется на диспетчере, откуда пришёл вызов.",
    example: "Если в цепочке несколько flowOn с разными диспетчерами, каждый влияет только на участок цепочки выше себя и ниже предыдущего flowOn — это часто путает разработчиков с опытом в RxJava.",
    code: `flow {
    emit(loadFromNetwork()) // выполнится на IO
}
.flowOn(Dispatchers.IO) // диспетчер для всего, что выше
.map { heavyCpuTransform(it) } // выполнится на диспетчере вызывающего (например, Main)
.collect { updateUi(it) }`
  },

  // ---------------- КОНКУРЕНТНОСТЬ/МНОГОПОТОЧНОСТЬ ----------------
  {
    id: "conc1", cat: "concurrency", q: "Как работает synchronized 'под капотом' и что такое монитор?",
    what: "synchronized — механизм JVM для взаимоисключающего доступа к общему ресурсу через объект-монитор (intrinsic lock), встроенный в каждый Java/Kotlin-объект.",
    key: "Для synchronized-метода монитором выступает сам объект (this), для синхронизированного статического метода — объект класса (Class). Поток, зашедший в synchronized-блок, захватывает монитор; другие потоки, пытающиеся войти в ЛЮБОЙ synchronized-блок с тем же монитором, блокируются до освобождения. Важный нюанс: synchronized реентерабелен — поток, уже владеющий монитором, может повторно войти в другой synchronized-блок того же объекта без самоблокировки.",
    example: "synchronized(lockObject) { ... } на конкретном объекте-мьютексе — более узкая и производительная синхронизация, чем synchronized на весь метод, если реально нужно защитить только часть логики.",
    code: `class Counter {
    private var count = 0
    private val lock = Any()

    fun increment() {
        synchronized(lock) { // монитор — именно объект lock, а не this
            count++
        }
    }
}`
  },
  {
    id: "conc2", cat: "concurrency", q: "Что именно даёт ключевое слово volatile?",
    what: "volatile — модификатор поля, гарантирующий видимость (visibility) изменений между потоками и запрещающий переупорядочивание инструкций (instruction reordering) компилятором/процессором вокруг этого поля.",
    key: "Без volatile поток может закэшировать значение переменной в своём процессорном кэше/регистре и не увидеть изменение, сделанное другим потоком (например, в бесконечном while-цикле проверки флага). volatile заставляет читать и писать значение напрямую из основной памяти (main memory), минуя локальный кэш потока. Важно: volatile НЕ даёт атомарности составных операций (например, count++ — это чтение+инкремент+запись, три отдельных шага, между которыми другой поток может вклиниться).",
    example: "Именно поэтому volatile хорош для простого флага-сигнала (@Volatile var isRunning = true), но не годится для счётчика — для него нужны Atomic-типы или synchronized.",
    code: `class Worker {
    @Volatile private var isRunning = true // видимость гарантирована

    fun stop() { isRunning = false } // из одного потока
    fun run() {
        while (isRunning) { /* ... */ } // из другого потока увидит изменение сразу
    }
}`
  },
  {
    id: "conc3", cat: "concurrency", q: "Что такое Deadlock и как его избежать?",
    what: "Deadlock (взаимная блокировка) — ситуация, когда два (или более) потока бесконечно ждут друг друга, каждый удерживая ресурс, нужный другому.",
    key: "Классический сценарий: поток A захватил монитор объекта X и ждёт монитор объекта Y; поток B в это же время захватил монитор Y и ждёт монитор X. Ни один не может продолжить. Способы избежать: всегда захватывать несколько локов в едином согласованном порядке во всём приложении; использовать тайм-ауты при попытке захвата (tryLock с timeout); по возможности проектировать код без вложенных блокировок вообще.",
    example: "На собесе часто просят смоделировать: два метода переводят деньги между счетами A→B и B→A одновременно, каждый сначала блокирует 'свой' счёт — классический рецепт deadlock, если не зафиксировать порядок захвата (например, всегда сначала счёт с меньшим ID).",
    code: `// Плохо: порядок захвата зависит от направления перевода — риск deadlock
fun transfer(from: Account, to: Account, amount: Int) {
    synchronized(from) {
        synchronized(to) { /* ... */ }
    }
}

// Хорошо: всегда фиксированный порядок (например, по ID)
fun transferSafe(a: Account, b: Account, amount: Int) {
    val (first, second) = if (a.id < b.id) a to b else b to a
    synchronized(first) {
        synchronized(second) { /* ... */ }
    }
}`
  },

  // ---------------- DAGGER (доп.) ----------------
  {
    id: "d4", cat: "di", q: "Как через Dagger Multibindings очистить данные во всех репозиториях разом при логауте?",
    what: "Multibindings (@IntoSet, @IntoMap) — механизм Dagger для сборки коллекции объектов от РАЗНЫХ модулей/классов под одним общим типом, без ручного перечисления всех реализаций в одном месте.",
    key: "Каждый репозиторий реализует общий интерфейс (например, Clearable с методом clear()) и биндится в Set через @IntoSet. При логауте достаточно заинжектить Set<Clearable> и пройтись циклом — не нужно руками дописывать вызов clear() для каждого нового репозитория, который появится в будущем.",
    example: "Это прямое применение Open/Closed принципа (O из SOLID) — добавление нового репозитория не требует изменения кода логаута, только реализации интерфейса и биндинга.",
    code: `interface Clearable { fun clear() }

@Module
abstract class RepoModule {
    @Binds @IntoSet
    abstract fun bindUserRepoClearable(impl: UserRepositoryImpl): Clearable

    @Binds @IntoSet
    abstract fun bindCacheRepoClearable(impl: CacheRepositoryImpl): Clearable
}

class LogoutUseCase @Inject constructor(
    private val clearables: Set<@JvmSuppressWildcards Clearable>
) {
    operator fun invoke() = clearables.forEach { it.clear() }
}`
  },

  // ---------------- HILT ----------------
  {
    id: "hilt1", cat: "hilt", q: "Что делают @HiltAndroidApp и @AndroidEntryPoint и зачем нужны готовые компоненты Hilt?",
    what: "Hilt — надстройка над Dagger, которая берёт на себя написание бойлерплейт-кода (шаблонного кода) для стандартных Android-компонентов.",
    key: "@HiltAndroidApp на классе Application генерирует корневой DI-граф приложения. @AndroidEntryPoint на Activity/Fragment/Service подключает их к этому графу и позволяет использовать @Inject прямо в полях. Вместо ручного написания Component/Subcomponent под каждый экран (как в чистом Dagger), Hilt уже предоставляет готовые компоненты с правильной иерархией и временем жизни: SingletonComponent (на всё приложение), ActivityComponent, ViewModelComponent, FragmentComponent и т.д.",
    example: "Цена удобства: на очень крупных проектах (100+ модулей, 25 тыс.+ строк в сабкомпонентах) кодогенерация Hilt может заметно замедлять сборку — поэтому банки с гигантскими монолитами (пример из разбора Дом.РФ) иногда сознательно остаются на чистом Dagger.",
    code: `@HiltAndroidApp
class MyApplication : Application()

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var repository: WeatherRepository // Hilt сам заинжектит
}

@HiltViewModel
class MainViewModel @Inject constructor(
    private val repository: WeatherRepository
) : ViewModel()`
  },

  // ---------------- ПАТТЕРНЫ ----------------
  {
    id: "pat1", cat: "patterns", q: "Как правильно реализовать Singleton с двойной проверкой (Double-Checked Locking) и зачем там volatile?",
    what: "Double-Checked Locking — оптимизация ленивой инициализации синглтона: проверяем, создан ли объект, ДО захвата дорогого synchronized-блока, и ещё раз ПОСЛЕ входа в него (на случай если другой поток создал объект, пока мы ждали лока).",
    key: "Без volatile на поле экземпляра компилятор/процессор может переупорядочить инструкции создания объекта так, что другой поток увидит ссылку на ещё не до конца инициализированный объект (instruction reordering) — редкий, но реальный баг. volatile гарантирует, что присвоение ссылки станет видно другим потокам только ПОСЛЕ полного завершения конструктора.",
    example: "В Kotlin эта проблема решается проще и безопаснее через object (компилятор сам гарантирует потокобезопасную однократную инициализацию) или through by lazy(LazyThreadSafetyMode.SYNCHRONIZED).",
    code: `class Singleton private constructor() {
    companion object {
        @Volatile private var instance: Singleton? = null

        fun getInstance(): Singleton =
            instance ?: synchronized(this) {
                instance ?: Singleton().also { instance = it }
            }
    }
}
// Или проще и безопаснее в Kotlin:
object SingletonKt { /* компилятор сам обеспечивает потокобезопасность */ }`
  },
  {
    id: "pat2", cat: "patterns", q: "Где в Android SDK встречаются классические паттерны Builder и Factory?",
    what: "Builder — пошаговое конструирование сложного объекта с множеством опциональных параметров. Factory — делегирование создания объекта отдельному методу/классу вместо прямого вызова конструктора.",
    key: "NotificationCompat.Builder — хрестоматийный Builder: у уведомления десятки опциональных полей (иконка, звук, действия), и через цепочку .setXxx() их удобно задавать выборочно вместо конструктора с 20 параметрами. ViewModelProvider.Factory — Factory: ViewModel часто нужно создавать с параметрами, которые Android-система не может передать сама при пересоздании экрана, поэтому создание делегируется фабрике.",
    example: "На вопрос 'какие паттерны ты использовал недавно' почти всегда можно сослаться на ViewModelProvider.Factory или Retrofit.Builder — это не 'притянутый' пример, а реально используемый почти в каждом проекте код.",
    code: `val notification = NotificationCompat.Builder(context, channelId)
    .setSmallIcon(R.drawable.ic_notification)
    .setContentTitle("Заголовок")
    .setContentText("Текст")
    .build()`
  },
  {
    id: "pat3", cat: "patterns", q: "Что такое God Object и почему Context в Android — хрестоматийный пример?",
    what: "God Object (антипаттерн) — класс, который берёт на себя слишком много ответственности и становится центральной точкой связанности всей системы.",
    key: "Context отвечает одновременно за: доступ к ресурсам (strings, drawables), запуск компонентов (startActivity), доступ к системным сервисам (getSystemService), доступ к файловой системе, темы и стили — это прямое нарушение принципа единственной ответственности (Single Responsibility, S из SOLID). На интервью это частый вопрос 'на засыпку': назвать явное нарушение SRP в самом Android SDK.",
    example: "Практическое следствие: именно поэтому Context не должен 'протекать' в Domain-слой Clean Architecture — это тянет за собой десяток скрытых ответственностей и рушит тестируемость бизнес-логики.",
    code: null
  },

  // ---------------- АРХИТЕКТУРНЫЕ ПАТТЕРНЫ (доп.) ----------------
  {
    id: "ar3", cat: "arch", q: "Зачем вообще нужен UseCase, если можно вызывать репозиторий прямо из ViewModel?",
    what: "UseCase (он же Interactor) — класс, инкапсулирующий один конкретный сценарий бизнес-логики (например, 'получить погоду и сохранить в избранное').",
    key: "Прямой вызов репозитория из ViewModel работает для тривиальных случаев (просто отдать данные), но UseCase становится незаменим, когда бизнес-логика требует координации НЕСКОЛЬКИХ репозиториев или содержит правила, не относящиеся ни к одному конкретному источнику данных (например, 'если кэш старше часа — обновить, иначе отдать локальные данные'). Без UseCase эта логика либо дублируется по разным ViewModel, либо утекает в репозиторий, размывая его ответственность.",
    example: "Хороший тест на необходимость UseCase: если сценарий использует больше одного репозитория, или его логику нужно переиспользовать на 2+ экранах — заводи UseCase. Если это тривиальный прямой проброс одного метода — UseCase действительно будет лишним 'перекладчиком', как и подмечали интервьюеры на некоторых собесах.",
    code: `class GetWeatherWithFavoriteStatusUseCase(
    private val weatherRepo: WeatherRepository,
    private val favoritesRepo: FavoritesRepository // координация двух источников
) {
    suspend operator fun invoke(city: String): WeatherUi {
        val weather = weatherRepo.getWeather(city)
        val isFavorite = favoritesRepo.isFavorite(city)
        return weather.toUi(isFavorite)
    }
}`
  },

  // ---------------- ЧИСТЫЙ КОД ----------------
  {
    id: "clean1", cat: "cleancode", q: "Почему возврат MutableList наружу из класса считается плохой практикой?",
    what: "Инкапсуляция — сокрытие внутреннего состояния класса от внешнего изменения не через его же публичный API.",
    key: "Если публичный геттер отдаёт MutableList, любой внешний код может вызвать .add()/.clear() и незаметно изменить внутреннее состояние объекта в обход всей его логики (валидации, уведомлений об изменении и т.д.) — класс теряет контроль над собственными инвариантами. Решение: возвращать наружу иммутабельный List (сужение типа, не обязательно копирование), а мутировать список только внутренними методами класса.",
    example: "Второе следствие того же принципа — предпочитать val вместо var для полей: val не даёт переприсвоить саму ссылку на список целиком в обход контролируемых методов изменения.",
    code: `class Cart {
    private val _items = mutableListOf<Item>()
    val items: List<Item> get() = _items // наружу — только для чтения

    fun addItem(item: Item) { _items.add(item) } // изменение только через контролируемый метод
}`
  },
  {
    id: "clean2", cat: "cleancode", q: "DRY, KISS, YAGNI — в чём разница между этими принципами простыми словами?",
    what: "Три взаимодополняющих, но разных принципа простоты кода.",
    key: "DRY (Don't Repeat Yourself) — не дублировать одну и ту же логику в нескольких местах, а вынести в одно переиспользуемое место. KISS (Keep It Simple, Stupid) — предпочитать самое простое решение задачи из работающих, не усложнять ради 'красоты' архитектуры. YAGNI (You Aren't Gonna Need It) — не добавлять функциональность 'про запас, вдруг понадобится в будущем', если она не нужна прямо сейчас — это неоправданно усложняет код и увеличивает площадь для багов.",
    example: "Частый разбираемый на собесах кейс с YAGNI — кандидат предлагает оставить избыточный метод 'на будущее', и интервьюер просит обосновать, почему это не создаёт лишнюю сложность прямо сейчас без реальной необходимости.",
    code: null
  },

  // ---------------- ALGORITHMS (доп.) ----------------
  {
    id: "al2", cat: "algo", q: "Как найти недостающее число в массиве за O(n), не используя сортировку?",
    what: "Задача: дан массив 1..N, из него убрали одно число, нужно найти какое, не прибегая к O(n log n) сортировке.",
    key: "Оптимальное решение — воспользоваться формулой суммы арифметической прогрессии: сумма чисел от 1 до N равна N*(N+1)/2. Считаем фактическую сумму элементов массива и вычитаем её из ожидаемой суммы — разница и есть недостающее число. Сложность O(n) по времени и O(1) по памяти, вместо O(n log n) у сортировки.",
    example: "Альтернатива при рисках переполнения (overflow) для очень больших N — использовать XOR всех чисел от 1 до N, XOR-нутый с XOR всех элементов массива (свойство XOR: a^a=0 сокращает совпадающие пары).",
    code: `fun findMissingNumber(nums: IntArray, n: Int): Int {
    val expectedSum = n * (n + 1) / 2
    val actualSum = nums.sum()
    return expectedSum - actualSum
}`
  },

  // ---------------- ROOM + SQL ----------------
  {
    id: "room1", cat: "room", q: "Как проводить миграции Room при изменении структуры таблиц?",
    what: "Миграция (Migration) — описание того, как преобразовать структуру базы данных со старой версии схемы на новую, не потеряв уже сохранённые пользовательские данные.",
    key: "Room привязан к номеру version в аннотации @Database. При любом изменении Entity (новое поле, новая таблица, изменение типа колонки) нужно повысить version и явно написать Migration с SQL-командами перехода (ALTER TABLE и т.д.) — иначе Room выбросит исключение при старте (или, при fallbackToDestructiveMigration(), просто удалит всю базу — приемлемо только для кэша, не для пользовательских данных).",
    example: "Частый вопрос 'на засыпку' — что будет, если забыть написать миграцию и не указать fallbackToDestructiveMigration(): приложение крашится при первом обращении к базе после обновления.",
    code: `val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE users ADD COLUMN email TEXT DEFAULT NULL")
    }
}

Room.databaseBuilder(context, AppDatabase::class.java, "app.db")
    .addMigrations(MIGRATION_1_2)
    .build()`
  },
  {
    id: "room2", cat: "room", q: "В чём разница между @Embedded, @Relation и TypeConverter в Room?",
    what: "Три разных механизма Room для работы со сложными/связанными данными (подробно связано с карточкой в Android SDK, но с фокусом именно на выбор инструмента).",
    key: "@Embedded — просто разворачивает поля 'своего' объекта в колонки той же таблицы, без создания связи между таблицами. @Relation — говорит Room собрать граф из ДВУХ РАЗНЫХ таблиц (реальная связь через внешний ключ), выполняя дополнительный запрос под капотом. TypeConverter — нужен, когда тип поля в принципе не поддерживается SQLite напрямую (например, LocalDateTime, List<String>, Uri) — конвертер учит Room превращать такой тип в примитив (обычно String/Long) для хранения и обратно при чтении.",
    example: "Практическое правило выбора: @Embedded — для 'своих' data-классов без отдельной таблицы. @Relation — когда данные реально хранятся в разных таблицах. TypeConverter — для сторонних типов, которые нельзя аннотировать напрямую.",
    code: `class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?): LocalDateTime? =
        value?.let { LocalDateTime.ofEpochSecond(it, 0, ZoneOffset.UTC) }

    @TypeConverter
    fun toTimestamp(date: LocalDateTime?): Long? = date?.toEpochSecond(ZoneOffset.UTC)
}`
  },

  // ---------------- RETROFIT + REST API ----------------
  {
    id: "retro1", cat: "retrofit", q: "Как добавить токен авторизации сразу ко всем сетевым запросам (например, если их уже 50+)?",
    what: "OkHttp Interceptor — компонент, который перехватывает каждый HTTP-запрос/ответ в цепочке OkHttp ДО того, как он реально уйдёт в сеть (или после того, как пришёл ответ), и может его модифицировать.",
    key: "Вместо того чтобы руками добавлять заголовок Authorization в каждый из 50+ методов Retrofit-интерфейса, пишется один AuthInterceptor, который добавляется в OkHttpClient — и применяется автоматически ко ВСЕМ запросам, проходящим через этот клиент, без изменения кода самих API-методов.",
    example: "Это прямое применение принципа DRY — общая для всех запросов логика (заголовок токена) написана один раз в одном месте, а не дублируется по каждому эндпоинту.",
    code: `class AuthInterceptor(private val tokenProvider: () -> String) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer \${tokenProvider()}")
            .build()
        return chain.proceed(request)
    }
}

val client = OkHttpClient.Builder()
    .addInterceptor(AuthInterceptor { tokenStorage.getToken() })
    .build()`
  },
  {
    id: "retro2", cat: "retrofit", q: "Как правильно описать метод Retrofit-интерфейса с корутинами?",
    what: "Retrofit-интерфейс описывает эндпоинты декларативно через аннотации (@GET, @POST, @Path, @Query, @Body), а Retrofit генерирует реализацию под капотом.",
    key: "С корутинами метод объявляется как suspend fun и возвращает напрямую доменный/DTO-тип (не Call<T>) — Retrofit сам оборачивает вызов в корутино-совместимый adapter. Ошибки сети (таймаут, отсутствие интернета) выбрасываются как обычные исключения и ловятся через try/catch вокруг suspend-вызова, а не через отдельный callback, как было в старом Call-based подходе.",
    example: "Если нужен доступ к метаданным ответа (заголовки, HTTP-код), возвращают Response<T> вместо голого T — тогда суспенд-функция не бросает исключение на HTTP-ошибках 4xx/5xx, а явно возвращает их в response.code().",
    code: `interface WeatherApi {
    @GET("weather/{city}")
    suspend fun getWeather(@Path("city") city: String): WeatherDto

    @GET("weather/{city}")
    suspend fun getWeatherWithMeta(@Path("city") city: String): Response<WeatherDto>
}`
  },

  // ---------------- GIT ----------------
  {
    id: "git1", cat: "git", q: "merge vs rebase — в чём разница и когда что использовать?",
    what: "Обе команды применяются, чтобы 'подтянуть' изменения из одной ветки в другую, но по-разному переписывают историю коммитов.",
    key: "merge создаёт новый 'коммит слияния' (merge commit) с двумя родителями, сохраняя реальную историю разработки как она была (включая параллельные ветки) — безопаснее для командной работы, но история выглядит более 'запутанной'. rebase переносит коммиты твоей ветки поверх нового базового коммита, переписывая их хэши — история становится линейной и чище, но НЕЛЬЗЯ делать rebase уже запушенных публичных веток, которые кто-то ещё использует, — переписанная история сломает синхронизацию у коллег.",
    example: "Практическое правило: rebase — для своей локальной feature-ветки перед созданием Pull Request (чтобы история была чистой); merge — для интеграции в общие ветки (develop, main), которые уже расшарены с командой.",
    code: `# Обновить свою ветку изменениями из develop, сохранив линейную историю
git checkout feature/my-branch
git rebase develop

# Влить готовую фичу в develop с сохранением merge-коммита
git checkout develop
git merge feature/my-branch`
  },
  {
    id: "git2", cat: "git", q: "Что такое Gitflow и чем он отличается от Trunk-Based Development?",
    what: "Оба — модели ветвления (branching strategy), описывающие, как команда организует параллельную разработку в Git.",
    key: "Gitflow — долгоживущие ветки main (только релизы) и develop (текущая разработка) + отдельные feature/release/hotfix-ветки, которые в итоге вливаются в develop и main. Подходит большим командам с редкими релизами. Trunk-Based Development — почти все изменения идут напрямую (короткоживущими ветками) в единственную основную ветку (trunk/main), а незавершённые фичи скрываются за feature-тоглами (feature flags), а не долгоживущими ветками. Подходит командам с частыми релизами и CI/CD.",
    example: "В разобранных транскриптах интервью банки с редкими релизами (раз в месяц) чаще держатся за Gitflow, а команды с частыми деплоями (несколько раз в неделю) — за Trunk-Based + feature-тоглы.",
    code: null
  },

  // ---------------- TESTING (доп.) ----------------
  {
    id: "t4", cat: "testing", q: "Mock vs Fake — в чём разница в тестах?",
    what: "Оба — способы подменить реальную зависимость в тесте, чтобы изолировать тестируемый класс от её реального поведения.",
    key: "Mock (через библиотеку типа Mockito) — 'пустышка', которая ничего не делает сама по себе, пока ты явно не настроишь через whenever/verify, что она должна вернуть на конкретный вызов; хорош для проверки факта вызова метода. Fake — реальная, но упрощённая рабочая реализация интерфейса (например, WeatherRepository, хранящий данные в обычном HashMap в памяти вместо реальной сети/БД); ведёт себя как настоящая логика, просто без внешних зависимостей.",
    example: "Fake обычно предпочтительнее для тестирования сложного поведения (несколько последовательных вызовов с разным состоянием), а Mock — для простой проверки 'этот метод точно был вызван ровно один раз с такими параметрами'.",
    code: `// Fake — реальная упрощённая логика
class FakeWeatherRepository : WeatherRepository {
    private val storage = mutableMapOf<String, Weather>()
    override suspend fun getWeather(city: String) =
        storage[city] ?: throw NoSuchElementException()
    fun addWeather(city: String, weather: Weather) { storage[city] = weather }
}

// Mock — пустышка с настроенным поведением на конкретный вызов
val mockRepo = mock<WeatherRepository>()
whenever(mockRepo.getWeather("Rostov")).thenReturn(fakeWeather)`
  },

  // ---------------- KOTLIN (доп.) ----------------
  {
    id: "k4", cat: "kotlin", q: "Как работают SAM-conversions?",
    what: "SAM (Single Abstract Method) conversion — механизм, позволяющий передавать лямбду напрямую вместо интерфейса с ОДНИМ абстрактным методом, без явного создания анонимной реализации этого интерфейса.",
    key: "Компилятор сам оборачивает лямбду в подходящую реализацию интерфейса. Это критично для Java-интероперабельности: многие Android/Java API (например, `View.OnClickListener`, `Runnable`) — это функциональные Java-интерфейсы с одним методом, и Kotlin позволяет передать в них лямбду напрямую вместо `object : OnClickListener { override fun onClick(v: View) {...} }`.",
    example: "Для собственных Kotlin-интерфейсов SAM-conversion работает только если явно пометить интерфейс как `fun interface` (начиная с Kotlin 1.4) — без этой пометки лямбду напрямую передать не получится.",
    code: `// Java-интерфейс OnClickListener имеет один метод — SAM-conversion работает из коробки
button.setOnClickListener { view -> /* ... */ }

// Свой функциональный интерфейс — нужно fun interface
fun interface Validator { fun validate(input: String): Boolean }
val validator = Validator { it.isNotEmpty() } // тоже SAM-conversion`
  },

  // ---------------- COROUTINES (доп.) ----------------
  {
    id: "c5", cat: "coroutines", q: "Что такое Channel и Actor в корутинах, и когда нужен кастомный Dispatcher?",
    what: "Channel — примитив для передачи потока значений МЕЖДУ разными корутинами (аналог очереди, но suspend-совместимый — send/receive приостанавливают корутину вместо блокировки потока). Actor — паттерн поверх Channel: корутина с собственным приватным состоянием, к которому обращаются только через сообщения в канал, что исключает гонки данных без явных локов.",
    key: "Кастомный диспетчер создаётся оборачиванием обычного `java.util.concurrent.Executor` через `.asCoroutineDispatcher()` — нужен, когда требуется гарантированно последовательное выполнение на одном выделенном потоке (например, все операции с платежами должны идти строго по очереди, а не на общем пуле Dispatchers.IO).",
    example: "Actor — по сути официальная альтернатива synchronized/Mutex для защиты изменяемого состояния: вместо блокировки все изменения идут последовательно через единственный поток, читающий сообщения из канала.",
    code: `val paymentDispatcher = Executors.newSingleThreadExecutor().asCoroutineDispatcher()

val counterActor = CoroutineScope(Dispatchers.Default).actor<Int> {
    var counter = 0
    for (delta in channel) { counter += delta } // строго последовательно, без гонок
}`
  },

  // ---------------- FLOW (доп.) ----------------
  {
    id: "fl3", cat: "flow", q: "Что такое Backpressure и как его решать в Flow (buffer, conflate, collectLatest)?",
    what: "Backpressure — ситуация, когда источник данных (emitter) генерирует значения быстрее, чем подписчик (collector) успевает их обработать.",
    key: "buffer() — копит 'лишние' значения в очереди, чтобы emitter не ждал collector (полезно, если важно не потерять ни одного значения). conflate() — если collector не успевает, пропускает промежуточные значения и оставляет только последнее (полезно для быстро меняющихся данных типа позиции скролла). collectLatest() — при поступлении нового значения ОТМЕНЯЕТ ещё не завершённую обработку предыдущего и начинает обработку нового.",
    example: "conflate — для UI-состояния, где важен только актуальный снимок (progress bar). collectLatest — для поиска-по-мере-набора-текста (debounce-подобное поведение, где предыдущий 'ещё не завершённый' сетевой запрос нужно отменить при новом вводе).",
    code: `searchQueryFlow
    .collectLatest { query -> // отменит предыдущий поиск, если пришёл новый query
        val results = searchApi.search(query)
        updateUi(results)
    }`
  },

  // ---------------- ANDROID SDK (доп. 2) ----------------
  {
    id: "a7", cat: "android", q: "Deep Link vs App Link vs Deferred Deep Link — в чём разница?",
    what: "Все три механизма открывают конкретный экран приложения по ссылке, но отличаются уровнем доверия системы и поведением при отсутствии приложения.",
    key: "Deep Link — обычная кастомная схема (myapp://profile/42) через intent-filter; система не проверяет, что ссылка действительно принадлежит владельцу приложения, поэтому её может 'перехватить' любое другое приложение с таким же intent-filter. App Link — верифицированный Android системой https-адрес (через Digital Asset Links файл на сервере), который гарантированно откроет именно твоё приложение, если оно установлено, минуя диалог выбора приложения. Deferred Deep Link — ссылка, которая срабатывает ПОСЛЕ установки приложения из стора (человек кликнул по ссылке, у него не было приложения, установил его — и после первого запуска приложение всё равно 'помнит', на какой экран его вели).",
    example: "Deferred Deep Link обычно реализуют через сторонние SDK (Firebase Dynamic Links и аналоги), которые прокидывают параметр перехода через referrer установки из Google Play.",
    code: null
  },
  {
    id: "a8", cat: "android", q: "Что происходит в системе, когда пользователь кликает на иконку приложения (запуск от Zygote до onCreate)?",
    what: "Запуск приложения — это не 'создание процесса с нуля', а форк (fork) уже существующего специального процесса-шаблона Zygote, который Android держит постоянно запущенным именно для быстрого старта новых приложений.",
    key: "Порядок: 1) Launcher посылает системе Intent на запуск; 2) Activity Manager Service (AMS) просит Zygote сделать fork — это гораздо быстрее полной инициализации новой Dalvik/ART-виртуальной машины с нуля, так как Zygote уже 'прогрет' и содержит предзагруженные системные классы и ресурсы; 3) в новом форкнутом процессе создаётся объект Application и вызывается Application.onCreate(); 4) AMS запускает нужную Activity через её конструктор и жизненный цикл (onCreate → onStart → onResume).",
    example: "Именно поэтому тяжёлая логика в Application.onCreate() (инициализация тяжёлых SDK) напрямую увеличивает время холодного старта приложения — это самый первый код, который реально выполняется в новом процессе.",
    code: null
  },
  {
    id: "a9", cat: "android", q: "Чем отличаются Build Type, Product Flavor и Build Variant?",
    what: "Три связанных, но разных понятия системы сборки Gradle для Android.",
    key: "Build Type — техническая конфигурация сборки (debug/release: включён ли ProGuard, подпись, debuggable). Product Flavor — бизнес-вариант приложения с разным контентом/поведением при том же коде (например, 'free' и 'paid' версии, или разные бренды из одной кодовой базы). Build Variant — конкретная комбинация Flavor × Build Type, которая реально собирается (например, freeDebug, paidRelease) — именно её видно в выпадающем списке Build Variants в Android Studio.",
    example: "Flavor Dimensions нужны, когда у тебя два независимых измерения флейворов одновременно (например, 'free/paid' И 'brandA/brandB') — тогда Gradle комбинирует их по осям, а не просто списком.",
    code: null
  },

  // ---------------- ВЬЮ XML (доп.) ----------------
  {
    id: "vx4", cat: "viewxml", q: "Как touch-событие доходит до нужной View (dispatchTouchEvent vs onInterceptTouchEvent)?",
    what: "Touch-событие (MotionEvent) проходит по иерархии View сверху вниз (от родителя к самому глубокому дочернему элементу под пальцем), и на каждом уровне у ViewGroup есть шанс либо пропустить событие дальше, либо перехватить его себе.",
    key: "dispatchTouchEvent() — точка входа события в View/ViewGroup, решает, кому передать обработку. onInterceptTouchEvent() — есть только у ViewGroup, вызывается перед тем, как событие уйдёт к дочерним элементам; если вернуть true, ViewGroup 'забирает' событие себе, и дочерние View его больше не получат. onTouchEvent() — финальная обработка события конкретной View.",
    example: "Классический пример использования onInterceptTouchEvent() — SwipeRefreshLayout или ViewPager: родитель должен 'перехватить' горизонтальный свайп для смены страницы, даже если внутри находится кликабельная кнопка.",
    code: null
  },

  // ---------------- DAGGER (доп. 2) ----------------
  {
    id: "d5", cat: "di", q: "Что такое Composition Root и Dependency Graph?",
    what: "Composition Root — единственное место в приложении, где происходит реальная 'сборка' (wiring) всех зависимостей друг с другом — то есть где решается, какая конкретная реализация подставляется под каждый интерфейс.",
    key: "Dependency Graph — это визуальное/концептуальное представление всех связей между зависимостями (кто от кого зависит) во всём приложении; Dagger буквально генерирует этот граф на этапе компиляции и падает с ошибкой компиляции, если граф не может быть построен (например, забыли забиндить интерфейс). Composition Root не должен быть размазан по всему коду — если конкретные реализации 'протекают' в бизнес-логику, это нарушает Dependency Inversion.",
    example: "В приложении с Dagger/Hilt Composition Root — это фактически совокупность всех @Module-классов; в Manual DI (без библиотек) — это обычно единственный класс-контейнер, который создаётся в Application.onCreate().",
    code: null
  },

  // ---------------- АРХИТЕКТУРНЫЕ ПАТТЕРНЫ (доп. 2) ----------------
  {
    id: "ar4", cat: "arch", q: "UI State vs UI Event — почему нельзя хранить навигацию как обычное состояние?",
    what: "UI State — то, что описывает ТЕКУЩУЮ длительную ситуацию на экране (загрузка идёт / данные показаны / ошибка) и должно быть доступно в любой момент, даже после пересоздания экрана. UI Event — разовое действие (показать Toast, перейти на другой экран), которое должно произойти РОВНО один раз.",
    key: "Если хранить событие навигации в State (например, StateFlow), при пересоздании подписчика (поворот экрана) StateFlow отдаст своё последнее значение заново — и навигация случайно сработает повторно. Единый источник истины (Single Source of Truth) для состояния не означает, что разовые события нужно хранить тем же способом — для них нужен отдельный механизм с семантикой 'потребили один раз и забыли' (SharedFlow с replay=0, или Channel).",
    example: "Признак бага 'навигация происходит повторно при повороте экрана' почти всегда означает, что событие навигации ошибочно хранится как персистентное состояние вместо одноразового события.",
    code: null
  },
  {
    id: "ar5", cat: "arch", q: "DTO vs Domain Model — зачем нужны два разных объекта для одних и тех же данных?",
    what: "DTO (Data Transfer Object) — 'грязный' объект, повторяющий структуру ответа сервера (JSON) один в один, со всеми его особенностями (nullable-поля 'на всякий случай', странный нейминг бэкенда, версионные костыли API). Domain Model — 'чистый' объект, удобный для бизнес-логики приложения, не привязанный к конкретному формату конкретного API.",
    key: "Без разделения любое изменение контракта бэкенда (переименовали поле, поменяли формат даты) вынуждает переписывать код по всему приложению, включая UI. С разделением меняется только маппер (DTO → Domain) в одном месте, а вся остальная кодовая база продолжает работать с неизменной доменной моделью. Это прямое применение Single Responsibility — DTO отвечает за сериализацию, Domain Model — за бизнес-смысл.",
    example: "Если в UI/ViewModel напрямую используется класс с суффиксом `Dto` или `Response` — это тревожный звоночек: слой представления должен знать только о Domain-модели.",
    code: `data class UserDto(val usr_nm: String?, val brth_dt: String?) // прямая копия ответа сервера
data class User(val name: String, val birthDate: LocalDate)      // чистая доменная модель

fun UserDto.toDomain(): User = User(
    name = usr_nm.orEmpty(),
    birthDate = LocalDate.parse(brth_dt ?: "1970-01-01")
)`
  },

  // ---------------- JAVA (доп.) ----------------
  {
    id: "j4", cat: "java", q: "Когда использовать SparseArray/ArrayMap вместо HashMap на Android?",
    what: "SparseArray и ArrayMap — оптимизированные Android-специфичные коллекции, предложенные как более экономная по памяти замена HashMap для определённых сценариев.",
    key: "HashMap для каждой пары ключ-значение создаёт отдельный объект-обёртку (Entry) плюс тратит память на массив bucket'ов, что при малом количестве элементов — избыточные накладные расходы. SparseArray/ArrayMap хранят данные в простых параллельных массивах и используют бинарный поиск вместо хэширования — экономят память, но проигрывают в скорости на больших объёмах (O(log n) вместо O(1) у HashMap). Правило: для малых коллекций (обычно < 1000 элементов) на мобильном устройстве экономия памяти важнее — используй ArrayMap/SparseArray; для больших коллекций или частых операций — HashMap.",
    example: "SparseArray дополнительно избегает автобоксинга Integer-ключей (принимает примитивный int напрямую) — ещё один источник экономии памяти по сравнению с HashMap<Integer, V>.",
    code: null
  },

  // ---------------- JAVA (доп. 2) ----------------
  {
    id: "j5", cat: "java", q: "Что такое WeakHashMap и когда его применять?",
    what: "WeakHashMap — реализация Map, которая хранит КЛЮЧИ через слабые ссылки (WeakReference) вместо обычных (Strong) ссылок.",
    key: "Если на ключ больше нигде в программе нет обычной ссылки — сборщик мусора вправе удалить объект-ключ, и запись автоматически исчезнет из WeakHashMap сама, без ручного вызова remove(). Обычный HashMap так не умеет: пока запись лежит в мапе, она держит ключ живым независимо от того, нужен ли он где-то ещё в программе.",
    example: "Практический кейс — кэш 'привязанный к жизни объекта': например, храним доп. метаданные для View, пока эта View жива; как только View уничтожается и больше ниоткуда не используется, запись в WeakHashMap исчезает сама, без утечки памяти.",
    code: `val metadataCache = WeakHashMap<View, ViewMetadata>()
metadataCache[someView] = ViewMetadata(...)
// Когда someView больше нигде не используется — GC соберёт её,
// и запись в metadataCache исчезнет сама собой`
  },
  {
    id: "j6", cat: "java", q: "Что такое ThreadLocal и зачем он нужен?",
    what: "ThreadLocal — механизм, позволяющий каждому потоку иметь СВОЮ собственную независимую копию переменной, даже если все потоки обращаются к одному и тому же объекту ThreadLocal.",
    key: "Это способ избежать синхронизации в принципе, а не бороться с гонкой данных через locks — если у каждого потока своя копия, гонки просто не может возникнуть, потому что потоки не делят одно и то же значение.",
    example: "Классический пример — SimpleDateFormat в старом Java не потокобезопасен (мутирует внутреннее состояние при parse/format), но через ThreadLocal каждый поток получает свой экземпляр форматтера без блокировок.",
    code: `val threadLocalId = ThreadLocal.withInitial { Thread.currentThread().id }
// Каждый поток при обращении к threadLocalId.get() получит СВОЁ значение`
  },
  {
    id: "j7", cat: "java", q: "ReentrantLock, CountDownLatch, CyclicBarrier — чем отличаются друг от друга?",
    what: "Три разных примитива синхронизации из пакета java.util.concurrent для разных сценариев координации потоков.",
    key: "ReentrantLock — более гибкая альтернатива synchronized: можно попытаться захватить лок с таймаутом (tryLock), можно прервать ожидание, поддерживает несколько условий ожидания (Condition). CountDownLatch — 'счётчик обратного отсчёта', одноразовый: один или несколько потоков ждут, пока другие N потоков не вызовут countDown() ровно N раз (например, главный поток ждёт, пока 3 параллельные загрузки не завершатся). CyclicBarrier — похож на CountDownLatch, но многоразовый: группа потоков взаимно ждёт друг друга в определённой точке и потом все вместе продолжают выполнение (например, несколько потоков параллельно считают часть большой задачи и должны 'сойтись' перед следующим этапом).",
    example: "Ключевое отличие CountDownLatch от CyclicBarrier: CountDownLatch используется один раз и не может быть 'сброшен', CyclicBarrier можно переиспользовать многократно для повторяющихся фаз вычислений.",
    code: `val latch = CountDownLatch(3)
repeat(3) {
    thread { loadPart(it); latch.countDown() }
}
latch.await() // главный поток дождётся всех трёх countDown()`
  },
  {
    id: "j8", cat: "java", q: "Что такое Happens-Before в Java Memory Model?",
    what: "Happens-Before — формальное правило Java Memory Model (JMM), гарантирующее, что если операция A 'happens-before' операции B, то результат A гарантированно виден потоку, выполняющему B.",
    key: "Без такой гарантии компилятор/процессор вправе переупорядочивать инструкции и кэшировать значения в регистрах, и другой поток может увидеть 'устаревшее' значение переменной. synchronized, volatile и запуск/присоединение потока (Thread.start()/join()) — все создают отношение happens-before между операциями до и после них.",
    example: "Именно happens-before объясняет, ПОЧЕМУ volatile вообще работает: запись в volatile-переменную happens-before любого последующего чтения этой же переменной другим потоком — то есть JMM формально гарантирует видимость, а не просто 'на практике так получается'.",
    code: null
  },

  // ---------------- COMPOSE (доп.) ----------------
  {
    id: "cx4", cat: "compose", q: "Что такое State Hoisting (подъём состояния) в Compose?",
    what: "State Hoisting — паттерн, при котором Composable-функция НЕ хранит состояние сама внутри себя, а принимает текущее значение и колбэк для его изменения через параметры — то есть состояние 'поднимается' на уровень выше, к вызывающему коду.",
    key: "Это прямое применение принципа единственной ответственности (SRP) — Composable отвечает только за отображение и передачу событий наверх, а решение 'как именно меняется состояние' остаётся у вызывающего кода (обычно ViewModel). Побочный эффект — компонент становится stateless и намного проще переиспользуется и тестируется: чтобы протестировать его, не нужен реальный источник состояния, достаточно передать любое значение и заглушку-колбэк.",
    example: "Признак того, что стоит поднять состояние — если один и тот же Composable в разных местах экрана нужно использовать с разными данными, но сам компонент 'жёстко' хранит своё mutableStateOf внутри.",
    code: `// Без hoisting — компонент 'владеет' своим состоянием, его сложно переиспользовать
@Composable
fun SearchFieldBad() {
    var text by remember { mutableStateOf("") }
    TextField(value = text, onValueChange = { text = it })
}

// С hoisting — состояние поднято наверх, компонент просто отображает и сообщает о событиях
@Composable
fun SearchField(text: String, onTextChange: (String) -> Unit) {
    TextField(value = text, onValueChange = onTextChange)
}`
  },
  {
    id: "cx5", cat: "compose", q: "produceState и rememberUpdatedState — для чего нужны?",
    what: "produceState — способ создать Compose State, значение которого асинхронно обновляется корутиной, инкапсулируя логику загрузки прямо внутри самого состояния. rememberUpdatedState — 'запоминает' самое последнее значение переданного параметра/колбэка, даже если долгоживущий эффект (например, LaunchedEffect с ключом Unit) уже был запущен со старым значением.",
    key: "Проблема, которую решает rememberUpdatedState: если LaunchedEffect(Unit) запущен один раз и не перезапускается, а внутри него используется колбэк, полученный параметром — без rememberUpdatedState эффект будет держать ссылку на СТАРУЮ версию колбэка из первой композиции, даже если снаружи передали новый.",
    example: "produceState удобен, когда нужно превратить внешний асинхронный источник (например, Flow из другой библиотеки, не имеющей встроенной Compose-интеграции) в обычный Compose State одним вызовом, не создавая отдельный ViewModel.",
    code: `@Composable
fun rememberElapsedTime(onTimeout: () -> Unit): State<Int> {
    val currentOnTimeout by rememberUpdatedState(onTimeout) // всегда актуальный колбэк
    return produceState(initialValue = 0) {
        while (true) {
            delay(1000)
            value += 1
            if (value >= 60) { currentOnTimeout(); break }
        }
    }
}`
  },

  // ---------------- ЧИСТЫЙ КОД (доп.) ----------------
  {
    id: "clean3", cat: "cleancode", q: "Покажи все 5 принципов SOLID на одном сквозном Kotlin-примере",
    what: "SOLID — пять принципов объектно-ориентированного дизайна (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion), которые вместе делают код легче расширять и тестировать без переписывания существующих классов.",
    key: "S — каждый класс отвечает ровно за одну вещь (EmailValidator валидирует, не отправляет письма). O — новый способ оплаты добавляется НОВЫМ классом, а не правкой существующего if/when. L — любая реализация PaymentMethod должна вести себя предсказуемо, не бросая неожиданных исключений там, где базовый тип этого не делает. I — узкие интерфейсы (Payable) вместо одного 'толстого' с лишними методами. D — PaymentProcessor зависит от интерфейса PaymentMethod, а не от конкретных классов CardPayment/CashPayment.",
    example: "На собесе часто просят не просто перечислить буквы, а показать, как ИМЕННО текущий класс нарушает принцип и как это исправить — формула 'что это → как нарушается → как исправить' работает и здесь.",
    code: `// D: зависимость от абстракции, не от реализации
interface PaymentMethod { fun pay(amount: Int): Boolean }

// O: новый способ оплаты — новый класс, старый код не трогаем
class CardPayment : PaymentMethod {
    override fun pay(amount: Int): Boolean = true // логика оплаты картой
}
class CashPayment : PaymentMethod {
    override fun pay(amount: Int): Boolean = true // логика оплаты наличными
}

// S: единственная ответственность — только оркестрация оплаты
class PaymentProcessor(private val method: PaymentMethod) {
    fun process(amount: Int) = method.pay(amount)
}
// I: интерфейс узкий, не тянет лишние методы вроде refund() туда, где это не нужно`
  },

  // ---------------- COLLECTIONS / DATA STRUCTURES (Java, доп.) ----------------
  {
    id: "j9", cat: "java", q: "Как HashSet устроен внутри и почему TreeMap хранит элементы отсортированными?",
    what: "HashSet — на самом деле обёртка НАД HashMap: каждый элемент множества хранится как ключ в скрытой внутренней HashMap, а в качестве значения используется один общий служебный объект-заглушка. TreeMap — реализация Map на основе самобалансирующегося красно-чёрного дерева, поэтому обход элементов всегда идёт в отсортированном по ключу порядке.",
    key: "Именно поэтому в HashSet нельзя хранить два 'равных по equals' элемента: попытка добавить второй такой же — это попытка вставить в HashMap запись с уже существующим ключом, которая просто не создаёт новую запись (в отличие от HashMap.put(), где значение бы перезаписалось — в HashSet 'перезаписывать' нечего, ключ и есть весь смысл). TreeMap платит за сортировку логарифмической сложностью операций (O(log n)) вместо amortized O(1) у HashMap.",
    example: "Если на собесе спросят 'как бы ты реализовал Set, если бы его не было в языке' — правильный ответ буквально описывает то, как Java это уже сделала: через Map с фиктивным значением.",
    code: null
  },

  // ---------------- SYSTEM DESIGN ----------------
  {
    id: "sd1", cat: "sysdesign", q: "Как вообще начать System Design интервью и не утонуть в деталях",
    what: "System Design интервью для мобильного разработчика — это не про то, чтобы сразу выдать готовую архитектуру, а про то, чтобы показать структурированный ход мысли: как ты сужаешь неопределённую задачу до конкретного плана.",
    key: "Рабочая структура на 45–60 минут: 1) 2–5 мин знакомство (коротко, без лишнего); 2) 5 мин — сузить масштаб задачи (только клиент с готовым API? клиент + придумать API? реже — ещё и бэкенд); 3) 10–15 мин — сбор требований и высокоуровневая схема; 4) 20–30 мин — детальный разбор одного конкретного компонента по выбору интервьюера; 5) 5 мин — твои вопросы. Первый практический шаг — явно спросить интервьюера, какого масштаба задача, а не додумывать самому.",
    example: "Хороший сигнал для интервьюера — вслух проговаривать предположения ('я предполагаю, что авторизация уже реализована, правильно?') вместо молчаливых догадок — это и есть то самое 'озвучивай мысли', о котором тебе уже говорили на реальных мок-собесах.",
    code: null
  },
  {
    id: "sd2", cat: "sysdesign", q: "Как разделить требования на функциональные, нефункциональные и 'вне рамок'",
    what: "Три категории, которые обязательно нужно явно проговорить перед проектированием, чтобы не спроектировать что-то, чего от тебя не просили (или наоборот — забыть важное).",
    key: "Функциональные требования — что пользователь может СДЕЛАТЬ (обычно 3–5 самых ценных для бизнеса действий, например 'бесконечная лента', 'лайк', 'открыть детали'). Нефункциональные — как система должна себя вести НЕЗАВИСИМО от конкретной функции (оффлайн-режим, real-time обновления, экономия батареи/трафика). 'Вне рамок' — то, что явно исключается из обсуждения (авторизация, аналитика, навигация), чтобы не тратить время впустую, но при этом показать, что ты в курсе об их существовании.",
    example: "Пропуск этого шага — частая ошибка кандидатов: без явного разделения интервьюер не понимает, специально ли ты не упомянул авторизацию, или просто забыл о ней.",
    code: null
  },
  {
    id: "sd3", cat: "sysdesign", q: "Анатомия фича-модульной архитектуры — что входит в Feature API, а что в Impl",
    what: "Стандартная схема разбиения приложения на независимые фичи-модули для командной разработки.",
    key: "Feature API — публичный контракт фичи (интерфейсы UseCase, роутер для перехода на экран этой фичи) БЕЗ привязки к конкретному фреймворку или платформе — это тот самый Dependency Inversion (D из SOLID): другие модули зависят от абстракции, а не от реализации. Feature Impl — конкретная реализация (Compose/XML экраны, ViewModel, работа с сетью) — подключается только в App-модуле, а не напрямую в других фичах, иначе получаются циклические зависимости между фичами и ломается независимая сборка.",
    example: "Core-модули (навигация, авторизация, аналитика) — отдельная категория: они не разделяются на api/impl, потому что должны быть доступны всем фичам напрямую как готовый сервис.",
    code: null
  },
  {
    id: "sd4", cat: "sysdesign", q: "Offset vs Keyset vs Cursor пагинация — что выбрать для ленты",
    what: "Три способа реализовать постраничную загрузку списка данных с сервера, отличающихся тем, как клиент 'помнит', на чём остановился.",
    key: "Offset (limit+offset) — проще всего реализовать, но плохо себя ведёт на больших списках: если между запросами добавились новые элементы, сдвигаются позиции старых (page drifting — элементы дублируются или пропускаются). Keyset — использует значение последней загруженной записи (например, дату) вместо номера страницы, работает быстрее на больших объёмах, но требует, чтобы поле сортировки было естественно упорядоченным (timestamp). Cursor — сервер сам кодирует непрозрачный идентификатор позиции (обычно через base64), полностью отвязывая клиента от деталей БД — самый устойчивый к параллельным изменениям вариант, но сложнее в реализации на бэкенде.",
    example: "Для бесконечной ленты (как в реальном System Design интервью про Twitter/Авито) курсорная пагинация — обычно правильный выбор, потому что лента постоянно меняется, а offset в таких условиях даёт дубли и пропуски.",
    code: null
  },
  {
    id: "sd5", cat: "sysdesign", q: "Push vs Polling vs SSE vs WebSocket — как выбрать способ real-time обновлений",
    what: "Разные механизмы доставки 'живых' обновлений с сервера на клиент, с разным балансом простоты, надёжности и накладных расходов.",
    key: "Push-уведомления — просты, встроены в платформу, но не гарантированы на 100% и могут прийти с задержкой. Long polling — клиент держит соединение открытым, пока сервер не ответит — мгновенно, но дорого по серверным ресурсам. SSE (Server-Sent Events) — однонаправленный поток событий поверх одного HTTP-соединения — хорош, когда обновления идут только от сервера к клиенту. WebSocket — полный дуплекс, нужен, когда клиент тоже должен часто отправлять данные (например, чат).",
    example: "Частое комбинированное решение на реальных собесах — SSE как основной канал 'живых' обновлений + Push как резервный вариант, если у клиента в моменте нет активного соединения.",
    code: null
  },
  {
    id: "sd6", cat: "sysdesign", q: "Как разрешать конфликты между локальным и серверным состоянием в offline-first приложении",
    what: "Проблема возникает, когда пользователь менял данные без интернета на нескольких устройствах, а потом оба устройства одновременно синхронизируются с сервером.",
    key: "Локальное разрешение — устройство после выхода в сеть само сливает своё состояние с серверным и отправляет итог; просто реализовать, но небезопасно (устройство получает слишком много доверия) и не решает проблему одновременной синхронизации с нескольких устройств. Удалённое разрешение — сервер сам решает конфликт по своей логике, а устройство просто перезаписывает локальное состояние присланным ответом; сложнее на бэкенде, зато не требует обновления клиента при изменении правил разрешения конфликтов.",
    example: "Для банковских/платёжных операций разрешение конфликтов почти всегда должно быть на сервере — доверять клиентскому устройству финальное решение о состоянии денег недопустимо по соображениям безопасности.",
    code: null
  },

  // ---------------- RXJAVA ----------------
  {
    id: "rx1", cat: "rxjava", q: "Какие бывают Subjects в RxJava и чем отличаются?",
    what: "Subject — одновременно и Observable, и Observer: можно и подписаться на него, и вручную эмитить в него значения — это делает его 'мостом' между обычным кодом и реактивным миром.",
    key: "PublishSubject — отдаёт подписчику только те значения, что были эмитированы ПОСЛЕ подписки (пропущенное до подписки — потеряно). BehaviorSubject — при подписке сразу отдаёт последнее эмитированное значение (или заданное начальное), а затем все последующие — прямой аналог StateFlow в мире корутин. ReplaySubject — запоминает и отдаёт новому подписчику ВСЮ (или ограниченную) историю значений. AsyncSubject — отдаёт только самое последнее значение, и только после явного вызова onComplete().",
    example: "BehaviorSubject — самый близкий аналог того, как ведёт себя StateFlow (всегда есть 'текущее' значение), а PublishSubject ближе к SharedFlow с replay=0.",
    code: null
  },
  {
    id: "rx2", cat: "rxjava", q: "Hot vs Cold Observable — и как превратить один в другой",
    what: "Cold Observable создаёт свой источник данных заново для КАЖДОГО нового подписчика (аналог обычного cold Flow). Hot Observable — один общий источник, существующий независимо от подписчиков, которые просто 'подключаются' к уже идущему потоку.",
    key: "Превратить cold в hot можно операторами publish() (превращает в ConnectableObservable) + connect() (запускает эмиссию вручную, в нужный момент, а не при первой подписке) — это позволяет нескольким подписчикам разделить один и тот же реальный сетевой запрос вместо того, чтобы каждый вызывал его заново. Обратное превращение (hot → cold) обычно делают через обёртку, которая при каждой новой подписке заново инициирует получение актуального 'снимка' состояния.",
    example: "Практический кейс: если 3 разных экрана подписываются на один и тот же сетевой Observable без publish()+connect(), сработает 3 РЕАЛЬНЫХ сетевых запроса вместо одного общего — частая причина лишнего сетевого трафика в legacy-коде на RxJava.",
    code: null
  },
  {
    id: "rx3", cat: "rxjava", q: "subscribeOn vs observeOn в RxJava — куда именно каждый влияет?",
    what: "Оба меняют поток выполнения, но воздействуют на разные участки цепочки операторов.",
    key: "subscribeOn задаёт поток, на котором стартует ИСТОЧНИК данных (сам код внутри Observable.create/fromCallable) — если вызвать subscribeOn несколько раз в одной цепочке, реально сработает только тот вызов, что стоит БЛИЖЕ к источнику (самый первый по цепочке снизу вверх). observeOn переключает поток для ВСЕХ операторов, идущих ПОСЛЕ него по цепочке — можно вызывать несколько раз, и каждый вызов реально меняет поток для последующего участка.",
    example: "Типичная связка: subscribeOn(Schedulers.io()) — чтобы сетевой запрос ушёл в фоновый поток, и observeOn(AndroidSchedulers.mainThread()) перед подпиской — чтобы результат обработался в UI-потоке.",
    code: `apiService.getUser(id)
    .subscribeOn(Schedulers.io())       // источник (сетевой запрос) — в IO-потоке
    .observeOn(AndroidSchedulers.mainThread()) // всё после этой точки — в Main
    .subscribe { user -> updateUi(user) }`
  },
  {
    id: "rx4", cat: "rxjava", q: "flatMap vs concatMap vs switchMap — в чём разница на практике?",
    what: "Все три превращают каждый элемент потока в новый Observable и как-то объединяют результаты, но по-разному управляют порядком и конкуренцией.",
    key: "flatMap — запускает все внутренние Observable ПАРАЛЛЕЛЬНО и мержит результаты по мере готовности, не гарантируя исходный порядок. concatMap — то же самое, но СТРОГО последовательно: ждёт завершения одного внутреннего Observable, прежде чем начать следующий — сохраняет порядок ценой скорости. switchMap — при появлении НОВОГО элемента из исходного потока отменяет ещё не завершившийся предыдущий внутренний Observable и переключается на новый.",
    example: "switchMap — классический выбор для поиска-по-мере-набора-текста (аналог collectLatest во Flow): новый ввод пользователя должен отменить ещё не пришедший ответ на предыдущий запрос, а не показать устаревший результат поверх нового.",
    code: null
  },
  {
    id: "rx5", cat: "rxjava", q: "Что такое Backpressure в RxJava и чем Flowable отличается от Observable?",
    what: "Backpressure — ситуация, когда источник эмитит элементы быстрее, чем подписчик успевает их обработать (тот же концепт, что мы разбирали для Flow, только в мире RxJava).",
    key: "Observable НЕ поддерживает backpressure вообще — если источник слишком быстрый, элементы просто накапливаются в памяти без ограничений, что может привести к OutOfMemoryError. Flowable — специально спроектирован для потенциально больших/быстрых потоков и поддерживает стратегии backpressure (BUFFER, DROP, LATEST, ERROR) — подписчик может явно сообщить источнику, сколько элементов готов принять за раз через request(n).",
    example: "Практическое правило: для UI-событий (клики, текстовый ввод) обычно достаточно Observable — там элементов немного. Flowable нужен, когда источник данных потенциально неограниченный и быстрый — например, чтение большого файла построчно или поток событий от сенсора.",
    code: null
  },

  {
    id: "k5", cat: "kotlin", q: "Чем fold отличается от reduce?",
    what: "Обе функции 'сворачивают' коллекцию в одно значение, последовательно применяя лямбду к накопителю и очередному элементу.",
    key: "reduce использует ПЕРВЫЙ элемент коллекции как начальное значение накопителя — поэтому падает с исключением на пустой коллекции. fold требует явно передать начальное значение накопителя (любого типа, не обязательно совпадающего с типом элементов) — поэтому безопасно работает даже на пустой коллекции, просто вернёт это начальное значение.",
    example: "fold удобен, когда тип результата отличается от типа элементов — например, посчитать сумму длин строк в список чисел через fold(0) { acc, str -> acc + str.length }, что через reduce сделать напрямую нельзя.",
    code: `val nums = listOf(1, 2, 3, 4)
val sum1 = nums.reduce { acc, n -> acc + n }       // 10, старт — первый элемент (1)
val sum2 = nums.fold(100) { acc, n -> acc + n }    // 110, старт — явно заданные 100

val empty = emptyList<Int>()
empty.fold(0) { acc, n -> acc + n } // 0, безопасно
// empty.reduce { acc, n -> acc + n } // упадёт с UnsupportedOperationException`
  },
  {
    id: "k6", cat: "kotlin", q: "Sealed class vs sealed interface — когда что выбрать?",
    what: "Оба ограничивают набор возможных наследников компилятором на этапе компиляции (все наследники должны быть известны заранее, обычно в том же модуле/пакете), что позволяет компилятору проверять исчерпанность when-выражения без ветки else.",
    key: "sealed class может хранить общее состояние и логику в базовом классе (общие поля/методы для всех наследников). sealed interface нужен, когда наследнику требуется реализовать НЕСКОЛЬКО источников поведения одновременно (в Kotlin нет множественного наследования классов, но есть множественная реализация интерфейсов) — например, состояние экрана одновременно должно быть и Loadable, и Cacheable.",
    example: "Правило выбора: если наследникам не нужно ничего наследовать, кроме этой иерархии — берём sealed class (проще). Если наследнику нужно ЕЩЁ и реализовать другой интерфейс — берём sealed interface, чтобы не упереться в ограничение одиночного наследования классов.",
    code: `sealed interface ScreenState
sealed interface Cacheable // отдельная независимая способность

data class Loading(val progress: Int) : ScreenState
data class Success(val data: String) : ScreenState, Cacheable // реализует оба сразу
data class Error(val message: String) : ScreenState`
  },
  {
    id: "k7", cat: "kotlin", q: "Что происходит 'под капотом' у object и companion object в байт-коде?",
    what: "object declaration компилируется в обычный final-класс с единственным статическим полем INSTANCE и приватным конструктором — JVM гарантирует, что этот класс проинициализируется ровно один раз, потокобезопасно, при первом обращении (ленивая инициализация обеспечивается самим механизмом загрузки классов JVM).",
    key: "companion object компилируется в отдельный вложенный класс с именем Companion внутри основного класса — то есть technically это НЕ статические члены самого класса, а поля экземпляра объекта Companion. Чтобы реально сгенерировать статический метод/поле для удобного вызова из Java, нужна аннотация @JvmStatic — без неё Java-код будет вынужден писать MyClass.Companion.method() вместо привычного MyClass.method().",
    example: "Именно поэтому companion object 'притворяется' статикой только в Kotlin-коде (компилятор Kotlin сам подставляет неявный доступ через Companion) — а для Java-интеропа нужна явная аннотация.",
    code: `class Config {
    companion object {
        @JvmStatic
        fun getDefault(): Config = Config() // без @JvmStatic из Java пришлось бы Config.Companion.getDefault()
    }
}`
  },
  {
    id: "k8", cat: "kotlin", q: "lateinit vs by lazy — детальное сравнение",
    what: "Оба откладывают инициализацию свойства, но решают разные задачи и работают по-разному механически.",
    key: "lateinit — для var (мутабельного, не-nullable, не-примитивного) свойства, инициализируемого КЕМ-ТО СНАРУЖИ позже (типичный кейс — поле, которое заполняет DI-фреймворк). by lazy — для val (иммутабельного) свойства, которое САМО вычисляет своё значение через переданную лямбду при ПЕРВОМ обращении, и дальше кэширует результат навсегда. lazy по умолчанию потокобезопасен (LazyThreadSafetyMode.SYNCHRONIZED) — можно ослабить до NONE, если точно знаешь, что доступ будет только из одного потока, ради производительности.",
    example: "Проверка инициализации lateinit-переменной: `if (::propertyName.isInitialized)` — специальный синтаксис через ссылку на свойство, который есть только у lateinit.",
    code: `lateinit var repository: WeatherRepository // заполнит Dagger/Hilt позже

val heavyParser: Parser by lazy { HeavyParser() } // вычислится один раз при первом обращении

if (::repository.isInitialized) { /* безопасно использовать */ }`
  },
  {
    id: "k9", cat: "kotlin", q: "const val vs val — когда именно вычисляется значение?",
    what: "Обе объявляют неизменяемую ссылку, но отличаются МОМЕНТОМ вычисления значения.",
    key: "const val — константа времени КОМПИЛЯЦИИ: значение должно быть известно уже при компиляции (только примитивы и String), объявляется на верхнем уровне файла или внутри object/companion object (не может быть внутри обычного класса или функции). Компилятор буквально подставляет значение прямо в байт-код в местах использования (аналог #define в C). val — вычисляется в РАНТАЙМЕ, при первом выполнении соответствующей строки кода, может содержать результат вызова функции.",
    example: "const val API_VERSION = \"v2\" — компилируется в константу. val currentTime = System.currentTimeMillis() — так сделать через const val нельзя, потому что значение не известно на этапе компиляции.",
    code: `const val MAX_RETRY = 3 // время компиляции — только на верхнем уровне или в object

class Config {
    val createdAt = System.currentTimeMillis() // время выполнения — можно внутри класса
}`
  },
  {
    id: "k10", cat: "kotlin", q: "Any, Unit и Nothing — три особых типа Kotlin",
    what: "Три типа на разных 'полюсах' системы типов Kotlin.",
    key: "Any — корень иерархии типов (аналог Object в Java, но без nullable по умолчанию — Any? нужен явно для допуска null). Unit — единственный синглтон-объект, аналог void в Java, но в отличие от void это полноценный тип, который можно использовать как generic-параметр. Nothing — подтип ВСЕХ типов без единого инстанса (0 экземпляров существует в принципе) — используется для функций, которые никогда нормально не возвращают управление (бросают исключение или бесконечный цикл), что позволяет компилятору корректно типизировать выражения вроде val x: String = error(\"...\") — Nothing совместим с любым ожидаемым типом.",
    example: "TODO() возвращает Nothing — именно поэтому код с TODO() компилируется в любом месте, независимо от ожидаемого типа возврата функции.",
    code: `fun fail(message: String): Nothing = throw IllegalStateException(message)

val value: String = if (condition) "ok" else fail("bad state")
// компилируется, потому что Nothing — подтип String`
  },
  {
    id: "k11", cat: "kotlin", q: "В чём разница между == и === в Kotlin?",
    what: "== — проверка структурного равенства (вызывает под капотом .equals()). === — проверка ссылочного равенства (указывают ли обе переменные на ОДИН И ТОТ ЖЕ объект в памяти).",
    key: "Для data class == сравнивает содержимое полей (так как equals() сгенерирован автоматически), а === всегда сравнивает именно ссылки, даже для data class с одинаковыми полями в разных объектах.",
    example: "Классическая ловушка на собесе: два отдельно созданных data class с одинаковыми полями — a == b вернёт true, а a === b вернёт false, потому что это два разных объекта в памяти с одинаковым содержимым.",
    code: `data class Point(val x: Int, val y: Int)
val p1 = Point(1, 2)
val p2 = Point(1, 2)
println(p1 == p2)  // true — содержимое совпадает
println(p1 === p2) // false — это два разных объекта в памяти`
  },
  {
    id: "k12", cat: "kotlin", q: "Sequences vs Collections — в чём разница в вычислении цепочки операторов?",
    what: "Collections (List/Set/Map) выполняют каждый оператор цепочки СРАЗУ и полностью, создавая промежуточную коллекцию на каждом шаге. Sequence выполняет операторы ЛЕНИВО — элемент за элементом проходит ВСЮ цепочку операторов, прежде чем взяться за следующий элемент, без создания промежуточных коллекций.",
    key: "На большой коллекции с несколькими цепочечными операторами (map().filter().take(5)) обычный List создаст полный промежуточный список на каждом шаге (map создаёт весь новый список, потом filter — ещё один и т.д.), а Sequence обработает ровно столько элементов, сколько нужно для получения первых 5 результатов, и остановится раньше — экономя и память, и время.",
    example: "Правило: для коротких коллекций разница незаметна и Sequence даже может быть медленнее (накладные расходы на обёртку); для больших коллекций с длинными цепочками операторов и early-exit операциями (take, first) — Sequence выигрывает ощутимо.",
    code: `val result = list.asSequence()
    .map { it * 2 }      // не выполняется сразу
    .filter { it > 10 }  // не выполняется сразу
    .first()             // ТОЛЬКО здесь запускается вся цепочка, поэлементно, до первого подходящего`
  },
  {
    id: "k13", cat: "kotlin", q: "Как работает деструктуризация (componentN) и почему у List только 5 компонентов по умолчанию?",
    what: "Деструктуризация — синтаксис val (a, b) = pair, который под капотом вызывает функции component1(), component2() и так далее у объекта справа.",
    key: "data class автоматически генерирует componentN() для каждого поля конструктора. У встроенного List в Kotlin определены только component1()...component5() как extension-функции стандартной библиотеки — для шестого элемента их просто не предусмотрели, поэтому val (a,b,c,d,e,f) = list не скомпилируется без своей component6().",
    example: "Решение — написать свою extension-функцию component6() для List<T>, и деструктуризация с шестью переменными заработает, потому что компилятор просто ищет функцию с нужным именем, а не какой-то встроенный жёстко заданный список.",
    code: `operator fun <T> List<T>.component6(): T = this[5]

val (a, b, c, d, e, f) = listOf(1, 2, 3, 4, 5, 6) // теперь скомпилируется`
  },
  {
    id: "k14", cat: "kotlin", q: "Что такое value class (бывшие inline class) и зачем нужны?",
    what: "value class — обёртка над ОДНИМ значением, которая на этапе компиляции в большинстве случаев 'исчезает' и заменяется напрямую самим значением, не создавая реального объекта-обёртки в памяти.",
    key: "Даёт типобезопасность без цены в производительности — например, вместо того чтобы передавать простой Int как userId (и случайно перепутать его местами с productId, тоже Int), можно завести value class UserId(val value: Int), и компилятор не даст перепутать их местами, при этом в большинстве мест в скомпилированном байт-коде реального объекта-обёртки не будет — только чистый Int.",
    example: "Обёртка всё же материализуется в реальный объект в отдельных случаях (например, если value class используется как generic-параметр, или хранится в коллекции) — это единственный компромисс механизма.",
    code: `@JvmInline
value class UserId(val value: Int)

@JvmInline
value class ProductId(val value: Int)

fun getUser(id: UserId) { /* ... */ }
// getUser(ProductId(5)) — не скомпилируется, хотя оба обёртки над Int`
  },
  {
    id: "k15", cat: "kotlin", q: "Как работают делегированные свойства (property delegation) через by?",
    what: "Делегирование свойства — механизм, при котором логика чтения/записи свойства передаётся ДРУГОМУ объекту (делегату), который реализует специальные операторные функции getValue()/setValue().",
    key: "Компилятор просто вызывает делегат.getValue(...) вместо прямого чтения поля, и делегат.setValue(...) вместо прямой записи — это позволяет вынести повторяющуюся логику (например, 'сохранить в SharedPreferences при изменении') в один переиспользуемый класс-делегат вместо дублирования кода в каждом свойстве (прямое применение DRY).",
    example: "by lazy и lateinit — тоже, по сути, делегаты стандартной библиотеки; своим делегатом можно реализовать, например, автоматическое сохранение значения в SharedPreferences при каждой записи в свойство.",
    code: `class PreferenceDelegate<T>(private val prefs: SharedPreferences, private val key: String, private val default: T) {
    operator fun getValue(thisRef: Any?, property: KProperty<*>): T =
        prefs.getString(key, default.toString()) as T
    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: T) {
        prefs.edit().putString(key, value.toString()).apply()
    }
}

class Settings(prefs: SharedPreferences) {
    var username: String by PreferenceDelegate(prefs, "username", "") // не дублируем логику в каждом свойстве
}`
  },

  {
    id: "a10", cat: "android", q: "BroadcastReceiver: статическая vs динамическая регистрация, sticky broadcast, ограничения Android 8",
    what: "BroadcastReceiver получает системные или кастомные широковещательные сообщения (broadcast) — например, о смене заряда батареи или о завершении загрузки файла.",
    key: "Статическая регистрация (в AndroidManifest.xml) — ресивер живёт независимо от состояния приложения, даже если оно закрыто. Динамическая регистрация (registerReceiver() в коде) — привязана к жизненному циклу компонента, где её вызвали (обычно снимается в onStop/onDestroy). Начиная с Android 8.0, статическая регистрация для большинства неявных (implicit) broadcast'ов ЗАПРЕЩЕНА — это было сделано, чтобы приложения не просыпались в фоне от чужих системных событий и не сажали батарею; динамическая регистрация по-прежнему разрешена для любых broadcast'ов.",
    example: "Sticky broadcast (устаревший, не рекомендуется) — broadcast, который система 'запоминает' и сразу же отдаёт новому подписчику при регистрации, даже если broadcast был отправлен до его подписки (пример — ACTION_BATTERY_CHANGED).",
    code: null
  },
  {
    id: "a11", cat: "android", q: "Started vs Bound vs Foreground Service — и что означают START_STICKY/START_NOT_STICKY/START_REDELIVER_INTENT?",
    what: "Service — компонент для выполнения работы без пользовательского интерфейса, но с разными моделями взаимодействия с остальным приложением.",
    key: "Started Service — запускается через startService()/startForegroundService() и работает независимо, пока сам себя не остановит или его не остановят снаружи; не возвращает результат напрямую вызывающему. Bound Service — клиент-серверная модель: компонент 'привязывается' (bindService()) и может вызывать методы сервиса напрямую и получать результат, сервис живёт, пока есть хотя бы один привязанный клиент. Foreground Service — Started Service с обязательным постоянным уведомлением, получает повышенный приоритет процесса и не убивается системой так же легко, как обычный фоновый сервис.",
    example: "Возвращаемое значение onStartCommand() определяет поведение при принудительном убийстве системой: START_STICKY — перезапустить сервис БЕЗ исходного Intent (аудиоплеер — не обязательно продолжать играть именно тот трек). START_NOT_STICKY — не перезапускать вообще (неважная фоновая задача). START_REDELIVER_INTENT — перезапустить с ТЕМ ЖЕ Intent, с которым сервис был запущен последний раз (важно для докачки большого файла — нужно повторить именно ту же задачу).",
    code: null
  },
  {
    id: "a12", cat: "android", q: "WorkManager vs Service — когда что использовать?",
    what: "WorkManager — библиотека Jetpack для ГАРАНТИРОВАННОГО выполнения отложенной или периодической фоновой работы, которая должна произойти даже если приложение закрыто или устройство перезагрузили.",
    key: "WorkManager сам решает ОПТИМАЛЬНЫЙ момент запуска задачи с учётом состояния системы (заряд батареи, наличие Wi-Fi, Doze Mode) — это фасад — единый удобный интерфейс поверх нескольких разных инструментов — поверх JobScheduler/AlarmManager/BroadcastReceiver в зависимости от версии Android. Service (обычный или Foreground) — для работы, которая должна выполняться ПРЯМО СЕЙЧАС и заметно для пользователя (аудио, навигация, звонок) — WorkManager для такого не годится, потому что не гарантирует немедленный запуск.",
    example: "Правило: периодическая синхронизация данных раз в час → WorkManager. Воспроизведение музыки, которое пользователь должен видеть и контролировать прямо сейчас → Foreground Service.",
    code: null
  },
  {
    id: "a13", cat: "android", q: "Что такое PendingIntent и чем отличается от обычного Intent?",
    what: "Intent описывает намерение выполнить действие ПРЯМО СЕЙЧАС, от имени текущего приложения. PendingIntent — 'обёртка' вокруг Intent, которая передаётся ДРУГОМУ приложению/компоненту системы (например, системе уведомлений или AlarmManager), чтобы то выполнило это действие ПОЗЖЕ, но с правами (permissions) исходного приложения, которое создало PendingIntent.",
    key: "Именно PendingIntent позволяет системе (например, при тапе на уведомление) запустить Activity твоего приложения, хотя сама система не имеет прямого доступа к его компонентам — она просто 'исполняет' заранее подготовленный PendingIntent от имени приложения.",
    example: "Уведомления, AlarmManager (запланированные напоминания), виджеты на рабочем столе — все используют PendingIntent, потому что действие инициирует не само приложение, а внешний компонент системы.",
    code: null
  },
  {
    id: "a14", cat: "android", q: "commit() vs apply() в SharedPreferences?",
    what: "Оба сохраняют изменения (Editor) в SharedPreferences, но отличаются синхронностью и возвращаемым результатом.",
    key: "commit() — синхронный, блокирует вызывающий поток до завершения записи на диск, возвращает boolean (успех/неуспех). apply() — асинхронный, немедленно применяет изменения в памяти (доступны сразу же для чтения) и в фоне записывает на диск, ничего не возвращает — не даёт узнать, успешно ли записалось физически.",
    example: "Правило: apply() почти всегда предпочтительнее, если не нужно знать точный результат записи синхронно (не блокирует UI-поток) — commit() оправдан только когда критично дождаться подтверждения записи перед следующим шагом.",
    code: null
  },
  {
    id: "a15", cat: "android", q: "Как связаны Handler, Looper и MessageQueue?",
    what: "Три компонента, вместе реализующие механизм очереди сообщений (event loop — цикл обработки событий) для однопоточной обработки задач в Android — именно так работает главный (UI) поток.",
    key: "Looper — бесконечный цикл, который постоянно вытаскивает сообщения из MessageQueue своего потока и по одному отдаёт их на обработку. MessageQueue — сама очередь сообщений/задач, привязанная к конкретному потоку. Handler — точка входа для ОТПРАВКИ сообщений/Runnable в очередь конкретного потока (и точка их ОБРАБОТКИ через handleMessage()) — Handler привязывается к Looper того потока, в котором был создан (или которому явно передан).",
    example: "У главного потока Looper создаётся системой автоматически при старте приложения (Looper.getMainLooper()) — именно поэтому Handler(Looper.getMainLooper()) из фонового потока позволяет доставить код на выполнение в UI-поток.",
    code: null
  },
  {
    id: "a16", cat: "android", q: "Serializable vs Parcelable — почему Android рекомендует именно Parcelable?",
    what: "Оба механизма превращают объект в поток байт для передачи между компонентами (например, через Intent extras).",
    key: "Serializable — стандартный Java-механизм, использует рефлексию для автоматического определения полей для сериализации — удобно (минимум кода), но заметно медленнее и создаёт больше временных объектов (мусора для сборщика), что критично на ограниченных ресурсах мобильного устройства. Parcelable — Android-специфичный механизм, где разработчик явно описывает, как объект пишется/читается из Parcel — требует больше кода (или аннотацию @Parcelize в Kotlin, которая генерирует его автоматически), зато работает в разы быстрее без рефлексии.",
    example: "В современном Kotlin-проекте разница в объёме кода почти исчезает благодаря @Parcelize — поэтому нет практической причины использовать Serializable для Android-специфичной передачи данных.",
    code: `@Parcelize
data class User(val name: String, val age: Int) : Parcelable
// Компилятор сам генерирует writeToParcel/createFromParcel — код почти как у Serializable,
// а производительность — как у ручного Parcelable`
  },
  {
    id: "a17", cat: "android", q: "SavedStateHandle vs onSaveInstanceState vs ViewModel — что переживает что?",
    what: "Три разных механизма сохранения состояния, переживающих РАЗНЫЕ типы уничтожения компонента.",
    key: "ViewModel сам по себе переживает смену конфигурации (поворот экрана), но НЕ переживает смерть процесса системой (когда Android убивает приложение в фоне ради памяти). onSaveInstanceState()/Bundle — переживает и смену конфигурации, и смерть процесса (система сохраняет Bundle отдельно от процесса), но ограничен по объёму (см. карточку про лимит Bundle) и подходит только для небольших примитивных данных. SavedStateHandle — современное решение, встроенное в ViewModel: автоматически связывает данные с тем же механизмом, что и onSaveInstanceState, но с удобным API внутри ViewModel — получаешь и переживание конфигурации (от ViewModel), и переживание смерти процесса (от SavedStateHandle) одновременно.",
    example: "Практическое правило: если данные можно легко перезапросить заново (например, из сети) — SavedStateHandle не нужен, обычного ViewModel достаточно. Если данные введены пользователем и их жалко терять (текст в поиске) — используй SavedStateHandle.",
    code: `class SearchViewModel(private val savedState: SavedStateHandle) : ViewModel() {
    var query: String
        get() = savedState.get<String>("query") ?: ""
        set(value) { savedState.set("query", value) } // переживёт и поворот, и смерть процесса
}`
  },
  {
    id: "a18", cat: "android", q: "Что такое ANR и как его можно детектировать самостоятельно?",
    what: "ANR (Application Not Responding) — системное предупреждение, возникающее, когда главный (UI) поток заблокирован слишком долго (обычно 5 секунд для Activity, меньше для BroadcastReceiver) и не успевает обработать очередное системное событие.",
    key: "Причина почти всегда одна — тяжёлая синхронная операция (сеть, диск, сложные вычисления) выполняется прямо в UI-потоке вместо фонового. Самодельный детектор ANR обычно строится на простом трюке: из фонового потока регулярно (например, раз в 5 секунд) отправлять пустое сообщение в Handler главного потока и замерять, сколько реально прошло времени, пока это сообщение обработалось — если разница сильно больше ожидаемой, значит главный поток был чем-то заблокирован.",
    example: "Инструменты для реальной диагностики (а не самодельные): StrictMode (ловит дисковые/сетевые операции в UI-потоке ещё в разработке) и системные ANR-трейсы (/data/anr/traces.txt на устройстве).",
    code: null
  },
  {
    id: "a19", cat: "android", q: "Что делают ProGuard/R8, и в чём разница обфускации, минификации и оптимизации кода?",
    what: "R8 — современный компилятор/оптимизатор кода в Android (заменил старый ProGuard), выполняющий три отдельные задачи при сборке релизной версии.",
    key: "Минификация (shrinking) — удаление неиспользуемого кода и ресурсов, чтобы уменьшить размер APK. Обфускация (obfuscation) — переименование классов/методов/полей в короткие бессмысленные имена (a, b, c...), чтобы затруднить реверс-инжиниринг (анализ чужого скомпилированного кода для восстановления логики) приложения конкурентами/злоумышленниками. Оптимизация (optimization) — упрощение самого байт-кода (инлайнинг мелких методов, удаление мёртвых веток кода) для ускорения работы приложения.",
    example: "Частая практическая проблема — обфускация может сломать код, использующий рефлексию (например, парсинг JSON по именам полей) — поэтому для таких классов приходится явно прописывать правила keep в конфигурации ProGuard/R8, чтобы их имена не переименовывались.",
    code: null
  },
  {
    id: "a20", cat: "android", q: "compileSdk vs targetSdk vs minSdk — в чём разница?",
    what: "Три разных числа в конфигурации Gradle, отвечающих за три разных аспекта совместимости приложения с версиями Android.",
    key: "minSdk — минимальная версия Android, на которой приложение вообще СМОЖЕТ запуститься (более старые устройства не смогут установить приложение из Google Play). compileSdk — версия SDK, с которой компилируется код (даёт доступ к новым API/классам на этапе разработки), не влияет напрямую на поведение в рантайме. targetSdk — версия, ПОД ПОВЕДЕНИЕ которой приложение 'подписывается' — начиная именно с этой версии Android применяет к приложению новые системные ограничения и изменения поведения (например, ограничения на фоновые сервисы из Android 8 применятся, только если targetSdk >= 26).",
    example: "Google Play требует регулярно повышать targetSdk до актуальных версий — иначе приложение перестают пускать в обновления/публикацию, даже если minSdk остаётся низким для поддержки старых устройств.",
    code: null
  },
  {
    id: "a21", cat: "android", q: "Doze Mode vs App Standby — в чём разница этих режимов энергосбережения?",
    what: "Два независимых механизма Android для экономии батареи за счёт ограничения фоновой активности приложений, но срабатывающих по разным условиям.",
    key: "Doze Mode — активируется, когда устройство физически неподвижно (лежит на столе) И экран выключен долгое время: система откладывает сетевые запросы, синхронизацию и джобы для ВСЕХ приложений разом, периодически ненадолго 'просыпаясь' для поддержания минимальной активности. App Standby — применяется ИНДИВИДУАЛЬНО к конкретному приложению, которым пользователь давно не пользовался (даже если устройство активно используется для других задач) — ограничивает именно это приложение в фоновой сетевой активности.",
    example: "Push-уведомления через Firebase Cloud Messaging специально спроектированы так, чтобы 'пробуждать' приложение даже в Doze Mode/App Standby — обычные же фоновые задачи в это время откладываются.",
    code: null
  },
  {
    id: "a22", cat: "android", q: "ContentProvider, ContentResolver и Cursor — как они связаны?",
    what: "ContentProvider — компонент для БЕЗОПАСНОГО обмена структурированными данными между разными приложениями (или внутри одного приложения, если так исторически сложилось), скрывающий за собой любой реальный источник данных (SQLite, файлы, сеть).",
    key: "ContentResolver — универсальный клиентский API, через который любой код обращается к ЛЮБОМУ ContentProvider'у (своему или чужому) по единообразному URI-адресу (content://...), не зная деталей его внутренней реализации. Cursor — объект-курсор, который ContentProvider возвращает в ответ на query() — это 'указатель' на строку результата в наборе данных, а не сразу все данные целиком, что экономит память при больших выборках.",
    example: "Системные ContentProvider'ы — примеры из реальной жизни: контакты телефона (ContactsContract), медиатека (MediaStore) — сторонние приложения читают их именно через ContentResolver, не имея прямого доступа к внутренней БД этих системных данных.",
    code: null
  },

  {
    id: "k16", cat: "kotlin", q: "Что такое typealias и во что он компилируется?",
    what: "typealias создаёт альтернативное, более короткое или понятное ИМЯ для уже существующего типа — не создаёт новый тип, а просто псевдоним.",
    key: "На этапе компиляции typealias полностью 'растворяется' — компилятор везде подставляет вместо псевдонима исходный тип, в байт-коде никакого отдельного класса не появляется (в отличие от value class, который иногда всё же материализуется в реальный объект). Основная польза — читаемость сложных generic-типов и документирование смысла через имя.",
    example: "Особенно полезен для длинных типов колбэков: вместо (Result<User>) -> Unit можно везде писать UserCallback — компилятор трактует это как один и тот же тип, поэтому функции с разными typealias, но одинаковым исходным типом взаимозаменяемы.",
    code: `typealias UserCallback = (Result<User>) -> Unit
typealias UserId = String // просто псевдоним, в отличие от value class UserId — можно случайно перепутать с обычным String

fun loadUser(id: UserId, callback: UserCallback) { /* ... */ }`
  },
  {
    id: "k17", cat: "kotlin", q: "Как работает vararg и spread-оператор (*)?",
    what: "vararg позволяет передать в функцию произвольное количество аргументов одного типа, которые внутри функции доступны как обычный массив.",
    key: "Если у тебя уже ЕСТЬ массив, и его нужно передать в vararg-параметр поэлементно (а не как один аргумент-массив), нужен spread-оператор * перед именем массива — без него компилятор попытается передать сам массив как один элемент, что не скомпилируется или даст неверный результат (в зависимости от сигнатуры).",
    example: "Классический вопрос на собесе: как объединить два массива в один список через listOf(), если listOf принимает vararg? Ответ — распаковать оба через *, иначе получится List<Array<Int>> вместо List<Int>.",
    code: `fun printAll(vararg numbers: Int) { numbers.forEach { println(it) } }

val arr1 = intArrayOf(1, 2, 3)
val arr2 = intArrayOf(4, 5, 6)

printAll(*arr1, *arr2) // spread — распаковывает оба массива поэлементно
val combined = listOf(*arr1.toTypedArray(), *arr2.toTypedArray())`
  },
  {
    id: "k18", cat: "kotlin", q: "Что такое infix-функции и как их писать самому?",
    what: "infix позволяет вызывать функцию с ровно одним параметром без точки и скобок — в виде 'receiver функция аргумент', что делает код похожим на естественный язык.",
    key: "Ограничения: infix-функция должна быть методом класса (или extension-функцией) и принимать РОВНО один параметр, без значений по умолчанию и без vararg. Компилятор просто транслирует инфиксную запись в обычный вызов метода — это чисто синтаксический сахар¹, никакой особой механики под капотом нет.",
    example: "Встроенный пример — to (создаёт Pair): 1 to 2 компилируется в 1.to(2). Можно объявить свою infix-функцию для DSL-подобного кода.",
    code: `infix fun Int.add(other: Int): Int = this + other
val sum = 3 add 5 // то же самое, что 3.add(5)

infix fun String.times(count: Int): String = this.repeat(count)
val repeated = "ha" times 3 // "hahaha"`
  },
  {
    id: "k19", cat: "kotlin", q: "Extension-функции: как работают под капотом и какие у них ограничения?",
    what: "Extension-функция позволяет 'добавить' метод к существующему классу (даже чужому, из библиотеки) без изменения его исходного кода и без наследования.",
    key: "Под капотом это обычная static-функция (в Java-терминах), принимающая объект-receiver первым скрытым параметром — реального изменения класса не происходит, поэтому extension-функция НЕ имеет доступа к private/protected членам класса (только к его публичному API). Если сигнатура extension-функции совпадает с реальным методом класса — всегда выигрывает РЕАЛЬНЫЙ метод класса, extension в этом случае просто никогда не вызовется (разрешение вызовов идёт статически, по объявленному типу переменной, а не динамически).",
    example: "Именно поэтому extension-функции не участвуют в полиморфизме так, как обычные методы — какая extension-функция вызовется, определяется типом переменной ВО ВРЕМЯ КОМПИЛЯЦИИ, а не реальным классом объекта в рантайме.",
    code: `fun String.shout() = this.uppercase() + "!" // extension, нет доступа к private полям String

open class Animal { open fun speak() = "..." }
class Dog : Animal() { override fun speak() = "Woof" }

fun Animal.speak() = "extension speak" // никогда не вызовется вместо метода класса
val a: Animal = Dog()
a.speak() // выведет "Woof" — метод класса всегда побеждает extension с той же сигнатурой`
  },
  {
    id: "k20", cat: "kotlin", q: "В какой модификатор превращается internal при компиляции в Java-байткод?",
    what: "internal в Kotlin означает 'видимо только внутри модуля¹ компиляции' — но в JVM-байткоде такого понятия видимости, как 'модуль', не существует в принципе (Java знает только private/package-private/protected/public).",
    key: "Компилятор решает эту проблему через 'уродование' имён (name mangling²): internal-члены компилируются как public в байт-коде, но их имя дополняется случайным суффиксом на основе имени модуля (например, doSomething становится doSomething$module_name). Это не настоящая защита — из Java-кода технически можно вызвать такой метод, зная точное сгенерированное имя, но случайно вызвать его невозможно, а IDE подсказки его не покажут.",
    example: "Именно поэтому internal считается 'модульной инкапсуляцией по договорённости', а не железной гарантией — в отличие от private, которая физически защищена самой JVM.",
    code: null
  },
  {
    id: "k21", cat: "kotlin", q: "Abstract class vs interface в Kotlin — в чём разница именно в Kotlin (не в Java)?",
    what: "Оба описывают контракт, который должны реализовать наследники, но с разными возможностями и ограничениями.",
    key: "Interface в Kotlin МОЖЕТ иметь реализацию методов по умолчанию (в отличие от старой Java до 8 версии) и объявлять свойства, но не может хранить состояние (backing field) — только abstract или с кастомным геттером без поля. Abstract class может хранить реальное состояние (val/var с полем) и конструктор с параметрами. Наследовать можно только ОДИН abstract class, но реализовывать СКОЛЬКО УГОДНО интерфейсов — прямое применение принципа Interface Segregation (I из SOLID¹): лучше несколько узких интерфейсов, чем один жёсткий класс-родитель.",
    example: "Правило выбора: если наследникам нужно общее состояние (не только поведение) — abstract class. Если просто контракт поведения, возможно множественный — interface.",
    code: `interface Flyable { fun fly() = println("Flying default way") } // есть реализация по умолчанию, но нет состояния

abstract class Bird(val name: String) { // может хранить состояние
    abstract fun makeSound()
}

class Eagle(name: String) : Bird(name), Flyable {
    override fun makeSound() = println("$name screeches")
}`
  },
  {
    id: "k22", cat: "kotlin", q: "Почему классы в Kotlin final по умолчанию, и что делает open?",
    what: "В отличие от Java (где классы открыты для наследования по умолчанию), в Kotlin все классы и методы ЗАКРЫТЫ (final) для наследования/переопределения, пока явно не помечены ключевым словом open.",
    key: "Это осознанное архитектурное решение дизайнеров языка: неограниченное наследование — частый источник хрупких иерархий и трудноуловимых багов (проблема хрупкого базового класса¹ — изменение родителя ломает поведение наследников непредсказуемым образом). Явное open заставляет разработчика ОСОЗНАННО решить, что этот класс/метод действительно предназначен для расширения — это прямое применение принципа KISS² (не делай возможным то, что не нужно) и Open/Closed из SOLID в его правильной трактовке: класс закрыт для модификации, но открыт для расширения ТОЛЬКО там, где это спроектировано намеренно.",
    example: "Практическое следствие: data class и по умолчанию final — от них вообще нельзя наследоваться, даже пометив open (это отдельное языковое ограничение), потому что data class полагается на строго определённый набор полей для equals/hashCode/copy.",
    code: `open class Animal(val name: String) {
    open fun speak() = "..."
}
class Dog(name: String) : Animal(name) {
    override fun speak() = "Woof" // без open в базовом классе это не скомпилировалось бы
}`
  },
  {
    id: "k23", cat: "kotlin", q: "Inner class vs nested (обычный вложенный) class — в чём разница?",
    what: "Оба объявляются внутри другого класса, но по-разному связаны с его экземпляром.",
    key: "Nested class (просто class Inner внутри Outer, без inner) — полностью независим, не имеет доступа к полям конкретного экземпляра внешнего класса, ведёт себя как обычный класс, объявленный 'для удобства' внутри другого. inner class — держит НЕЯВНУЮ ссылку на конкретный экземпляр внешнего класса (this@Outer), может обращаться к его полям, но требует создания через конкретный экземпляр Outer (outerInstance.InnerClass()).",
    example: "Важное следствие для утечек памяти: inner class, живущий дольше своего Outer (например, сохранённый где-то глобально), удерживает Outer в памяти через неявную ссылку — тот же механизм утечки, что мы разбирали с non-static Handler-классами в Java/Android.",
    code: `class Outer(val value: Int) {
    inner class Inner { fun show() = println(value) } // видит value внешнего класса
    class Nested { fun show() = println("no access to Outer's value") }
}

val outer = Outer(42)
val inner = outer.Inner() // создаётся ЧЕРЕЗ экземпляр Outer
val nested = Outer.Nested() // создаётся независимо`
  },
  {
    id: "k24", cat: "kotlin", q: "::class vs javaClass vs ::class.java — какая разница и когда что использовать?",
    what: "Три способа получить информацию о типе класса в рантайме, но с разным 'происхождением' и результатом.",
    key: "::class — возвращает KClass (собственную Kotlin-обёртку рефлексии, платформонезависимую — работает и в Kotlin Multiplatform). javaClass — свойство-расширение, возвращающее чистый java.lang.Class (Java-специфичный, работает только на JVM-таргете). ::class.java — явное преобразование KClass в java.lang.Class — нужно, когда API требует именно Java-класс (многие Java-библиотеки, включая Gson, принимают Class<T>, а не KClass<T>).",
    example: "В Multiplatform-проекте предпочтительнее ::class (работает на всех платформах), а для интеропа с Java-библиотеками (как в нашей карточке про reified с Gson) нужен именно ::class.java.",
    code: `val kClass = String::class          // KClass<String> — Kotlin-нативный
val javaClass1 = "hello".javaClass  // java.lang.Class — через экземпляр
val javaClass2 = String::class.java // java.lang.Class — через KClass`
  },
  {
    id: "k25", cat: "kotlin", q: "Null safety: ?., !! и ?: — когда что использовать (и почему !! почти всегда плохая идея)",
    what: "Три оператора для безопасной работы с nullable-типами (Type?), которые Kotlin вводит на уровне системы типов, чтобы ловить потенциальные NullPointerException ещё на этапе компиляции.",
    key: "?. (safe call) — вызывает метод/свойство, только если объект не null, иначе всё выражение возвращает null, не падая. ?: (Elvis-оператор) — возвращает значение слева, если оно не null, иначе — значение справа (запасной вариант). !! (not-null assertion) — принудительно говорит компилятору 'здесь точно не null', и если это неправда — приложение крашится с NullPointerException в рантайме, то есть !! фактически ОТКЛЮЧАЕТ всю защиту null safety в этой конкретной точке — используется как последний аварийный выход, когда ты действительно на 100% уверен, а не как привычка 'лишь бы скомпилировалось'.",
    example: "Хороший стиль — использовать ?: с осмысленным запасным значением или ранним return вместо !!: val name = user?.name ?: return безопаснее и понятнее, чем val name = user!!.name.",
    code: `val length: Int? = text?.length          // safe call — null, если text == null
val safeLength: Int = text?.length ?: 0  // Elvis — запасное значение 0
val riskyLength: Int = text!!.length     // !! — краш, если text == null (избегать)`
  },
  {
    id: "k26", cat: "kotlin", q: "Что такое Smart Cast и как компилятор его выполняет?",
    what: "Smart Cast — автоматическое приведение типа компилятором ПОСЛЕ явной проверки (is/null-проверки), без ручного каста разработчиком.",
    key: "Компилятор отслеживает поток управления (control flow¹): если внутри if (x is String) или if (x != null) переменная x гарантированно не меняется до конца блока, компилятор 'знает', что внутри этого блока можно безопасно обращаться к x как к String/не-null-типу напрямую, без явного as String.",
    example: "Smart cast НЕ сработает для var-свойств класса с кастомным геттером или для полей, доступных из другого потока — компилятор не может гарантировать, что значение не изменится между проверкой и использованием, поэтому в таких случаях придётся кэшировать значение в локальную val-переменную перед использованием.",
    code: `fun printLength(x: Any) {
    if (x is String) {
        println(x.length) // smart cast — x уже трактуется как String, без явного (x as String)
    }
}

fun printName(user: User?) {
    if (user != null) {
        println(user.name) // smart cast для null-safety — user уже не-nullable здесь
    }
}`
  },
  {
    id: "k27", cat: "kotlin", q: "Что такое platform types и что означает восклицательный знак (!) в подсказках IDE?",
    what: "Platform type — специальный 'неопределённый' тип, который Kotlin присваивает значениям, приходящим из Java-кода, где компилятор не может знать точную nullability (Java не имеет системы типов с null-safety, как Kotlin).",
    key: "Компилятор Kotlin НЕ заставляет тебя обрабатывать такое значение ни как строго nullable (Type?), ни как строго non-null (Type) — ответственность за проверку на null полностью перекладывается на разработчика (как в обычной Java). В IDE такой тип отображается с восклицательным знаком (String!) именно как визуальная подсказка 'здесь Kotlin не может гарантировать nullability, будь осторожен'.",
    example: "Частый источник NullPointerException в Kotlin-проектах, использующих Java-библиотеки — именно platform types: код компилируется без предупреждений, а падает в рантайме, если Java-метод неожиданно вернул null там, где Kotlin-разработчик считал это гарантированно не-null.",
    code: null
  },
  {
    id: "k28", cat: "kotlin", q: "noinline и crossinline — детальное объяснение, зачем нужен каждый",
    what: "Оба применяются к лямбда-параметрам ВНУТРИ inline-функции, но решают разные, противоположные по смыслу задачи.",
    key: "noinline — говорит компилятору НЕ встраивать конкретную лямбду в место вызова (оставить её обычным объектом-лямбдой) — нужен, когда эту лямбду нужно передать ДАЛЬШЕ, в другую (не-inline) функцию, сохранить в переменную или вернуть из функции — встроенный код так использовать нельзя, поэтому компилятор заставляет явно пометить такую лямбду noinline. crossinline — наоборот, ЗАПРЕЩАЕТ нелокальный return¹ внутри лямбды, оставляя её при этом встраиваемой (inline) — нужен, когда лямбда вызывается не напрямую, а из вложенного контекста (другой лямбды, объекта), откуда обычный return из внешней функции был бы небезопасен или невозможен.",
    example: "Практическое правило: если лямбда 'улетает' куда-то (сохраняется, передаётся дальше) — нужен noinline. Если лямбда вызывается из вложенного замыкания и при этом должна остаться inline — нужен crossinline.",
    code: `inline fun runTwice(inlined: () -> Unit, noinline savedForLater: () -> Unit) {
    inlined(); inlined()
    someExternalStorage.save(savedForLater) // noinline — лямбда 'улетает' в другое место
}

inline fun withCallback(crossinline onDone: () -> Unit) {
    thread {
        onDone() // вызов из другого потока/лямбды — crossinline запрещает return из onDone наружу runWithCallback
    }
}`
  },
  {
    id: "k29", cat: "kotlin", q: "Что такое Kotlin Multiplatform (KMP) простыми словами?",
    what: "Kotlin Multiplatform — технология, позволяющая писать ОБЩИЙ код (обычно бизнес-логику, сетевой слой, работу с БД) один раз на Kotlin и переиспользовать его на разных платформах (Android, iOS, Desktop, Web), сохраняя нативный UI под каждую платформу.",
    key: "Код делится на common (общий, платформонезависимый) и platform-specific модули с expect/actual декларациями¹ — в common-модуле объявляется 'ожидаемая' (expect) функция/класс без реализации, а каждая платформа предоставляет свою 'фактическую' (actual) реализацию под конкретный API платформы (например, для доступа к файловой системе).",
    example: "Практическая ценность для Middle-разработчика — компании всё чаще ищут людей с пониманием KMP, потому что это позволяет не дублировать бизнес-логику между Android- и iOS-командами, экономя реальные деньги на разработке.",
    code: `// common-модуль
expect fun getPlatformName(): String

// androidMain
actual fun getPlatformName(): String = "Android"

// iosMain
actual fun getPlatformName(): String = "iOS"`
  },
  {
    id: "k30", cat: "kotlin", q: "Result и подход Arrow — функциональная обработка ошибок вместо exceptions",
    what: "Альтернатива классическому throw/try-catch: явно возвращать результат операции как значение (успех ИЛИ ошибка), а не как побочный эффект в виде брошенного исключения.",
    key: "Result<T> (из стандартной библиотеки Kotlin, с версии 1.3) — обёртка с двумя состояниями: Success(value) или Failure(exception), с удобными функциями map/fold/getOrElse для цепочечной обработки без try-catch. Библиотека Arrow идёт дальше — предоставляет полноценные функциональные типы (Either<Error, T>, Option<T>) с богатым набором комбинаторов для сложных сценариев обработки ошибок в чисто функциональном стиле.",
    example: "Ключевое архитектурное преимущество — тип функции ЯВНО показывает в сигнатуре, что операция может завершиться неудачей (fun loadUser(): Result<User>), тогда как обычное исключение — это 'невидимый' побочный путь, который не отражён в сигнатуре и который легко забыть обработать.",
    code: `fun loadUser(id: String): Result<User> = runCatching {
    api.fetchUser(id) // может выбросить исключение внутри
}

loadUser("42")
    .map { it.name }
    .onSuccess { name -> println("Привет, $name") }
    .onFailure { error -> println("Ошибка: \${error.message}") }`
  },

  {
    id: "k31", cat: "kotlin", q: "Data class: что генерирует компилятор и какие есть ограничения?",
    what: "data class — класс, предназначенный специально для хранения данных; компилятор автоматически генерирует за тебя набор стандартных методов, которые иначе пришлось бы писать руками.",
    key: "Автоматически генерируются: equals()/hashCode() (сравнение по значениям всех полей из ПЕРВИЧНОГО конструктора), toString() (читаемое представление), copy() (создание копии с изменением отдельных полей) и componentN() для каждого поля (нужно для деструктуризации). Важное ограничение: поля, объявленные НЕ в первичном конструкторе (а в теле класса), не участвуют ни в equals/hashCode, ни в toString, ни в copy() — это единственный способ намеренно исключить поле из сравнения.",
    example: "data class не может быть open (нельзя явно унаследоваться от него), не может быть abstract, sealed или inner — потому что вся его семантика построена на строго определённом наборе полей, и наследование сломало бы гарантии equals/hashCode.",
    code: `data class User(val name: String, val age: Int) {
    var lastLoginTimestamp: Long = 0 // НЕ в конструкторе — не участвует в equals/hashCode/copy
}

val u1 = User("Аня", 25)
val u2 = u1.copy(age = 26) // копия с изменённым age, name остался прежним`
  },
  {
    id: "k32", cat: "kotlin", q: "Что такое функции высшего порядка простыми словами?",
    what: "Функция высшего порядка — функция, которая принимает ДРУГУЮ функцию как параметр, или сама ВОЗВРАЩАЕТ функцию как результат (в противовес обычной функции, работающей только с данными вроде чисел и строк).",
    key: "В Kotlin это возможно благодаря функциональным типам (Function0, Function1 и так далее — типы вроде (Int) -> String), которые компилятор генерирует автоматически под любую сигнатуру лямбды. Именно функции высшего порядка лежат в основе scope functions (let/apply), операторов коллекций (map/filter) и DSL-конструкций.",
    example: "map { it * 2 } — сама функция map является функцией высшего порядка: она принимает лямбду { it * 2 } как аргумент.",
    code: `fun <T, R> transform(items: List<T>, action: (T) -> R): List<R> = items.map(action) // action — функция как параметр

fun multiplierOf(factor: Int): (Int) -> Int = { number -> number * factor } // возвращает функцию`
  },
  {
    id: "k33", cat: "kotlin", q: "let, run, with, apply, also — как выбрать правильную scope-функцию?",
    what: "Все пять — scope-функции¹, временно создающие область видимости вокруг объекта, чтобы удобно обратиться к нему без повторения имени переменной. Различаются двумя параметрами: как ссылаться на объект внутри блока (this или it) и что возвращается в результате (сам объект или результат блока).",
    key: "let — объект доступен как it, возвращает РЕЗУЛЬТАТ блока (частый кейс — null-safe вызов через ?.let). run — объект доступен как this, возвращает результат блока (похож на let, но с this вместо it — удобнее, когда внутри блока много обращений к полям объекта). with — не extension-функция (принимает объект первым аргументом, а не через receiver), объект как this, возвращает результат блока. apply — объект как this, возвращает САМ ОБЪЕКТ (идеален для настройки/конфигурации объекта цепочкой). also — объект как it, возвращает САМ ОБЪЕКТ (идеален для побочных действий вроде логирования, не прерывающих основную цепочку).",
    example: "Практическое правило выбора: нужен результат блока → let/run/with. Нужно вернуть тот же объект дальше по цепочке → apply/also. Нужно часто обращаться к полям объекта → run/with/apply (через this, без явного it.).",
    code: `val length = text?.let { it.length } ?: 0 // let — null-safe, возвращает результат

val user = User().apply { // apply — настройка объекта, возвращает сам User
    name = "Аня"
    age = 25
}

val result = user.also { println("Создан: \${it.name}") } // also — побочный эффект, возвращает user`
  },
  {
    id: "k34", cat: "kotlin", q: "init-блок и primary/secondary constructors — как они связаны?",
    what: "Primary constructor — основной конструктор, объявляется прямо в заголовке класса (class User(val name: String)). Secondary constructor — дополнительный конструктор внутри тела класса для альтернативных сценариев создания объекта. init-блок — блок кода, который выполняется как часть инициализации primary constructor.",
    key: "Secondary constructor ОБЯЗАН в итоге делегировать вызов primary constructor (через this(...)), если он у класса есть — это гарантирует, что все init-блоки и инициализация полей из primary constructor выполнятся в любом случае, независимо от того, каким путём создан объект. Порядок выполнения: сначала инициализируются свойства primary constructor и выполняются init-блоки СВЕРХУ ВНИЗ в порядке объявления в файле, и только потом — тело secondary constructor.",
    example: "Частый вопрос 'на засыпку' — что если init-блоков несколько и они вперемешку с объявлением свойств? Они выполняются строго в том порядке, в котором написаны в файле сверху вниз, а не все init-блоки сначала.",
    code: `class User(val name: String) {
    val greeting: String

    init {
        println("Первый init-блок") // выполнится первым
        greeting = "Привет, $name"
    }

    constructor(name: String, age: Int) : this(name) { // secondary — делегирует primary
        println("Дополнительная логика для age = $age")
    }
}`
  },
  {
    id: "k35", cat: "kotlin", q: "Что такое звёздная проекция (star projection, <*>) в generics?",
    what: "Звёздная проекция List<*> используется, когда нужно работать с generic-типом, но неважно (или неизвестно) КАКОЙ конкретно тип-параметр внутри — по сути аналог 'списка чего-то неопределённого'.",
    key: "List<*> ведёт себя примерно как List<out Any?> (можно только читать элементы, получая их как Any?, но нельзя ничего добавлять внутрь, так как компилятор не знает точный тип и не может гарантировать безопасность вставки). Отличие от простого List<Any> — List<Any> означает КОНКРЕТНО список элементов типа Any, а List<*> означает 'список ЧЕГО-ТО одного конкретного типа, который мы не уточняем'.",
    example: "Типичный кейс — функция, которая просто выводит РАЗМЕР любого списка независимо от типа элементов: fun printSize(list: List<*>) — не важно, List<String> это или List<Int>, размер узнать можно без знания типа элементов.",
    code: `fun printSize(list: List<*>) {
    println(list.size) // читать метаданные можно, элементы — только как Any?
    // list.add(...) — не скомпилируется, тип неизвестен, добавлять нельзя
}

printSize(listOf("a", "b")) // работает с любым List<T>
printSize(listOf(1, 2, 3))`
  },
  {
    id: "k36", cat: "kotlin", q: "Как работают Labels (метки) во вложенных циклах и лямбдах?",
    what: "Label (метка) — именованная точка в коде вида someName@, к которой можно явно адресовать break, continue или return, чтобы управлять именно НУЖНЫМ уровнем вложенности, а не самым близким.",
    key: "Без метки break/continue всегда действуют на БЛИЖАЙШИЙ охватывающий цикл — если циклов несколько вложенных, а нужно прервать именно внешний, обычного break недостаточно. Аналогично, return внутри лямбды по умолчанию пытается сделать нелокальный возврат из внешней функции (если лямбда inline) — с меткой можно явно указать, что возврат должен завершить только саму лямбду, а не всю функцию.",
    example: "loop@ for (i in 1..10) { for (j in 1..10) { if (condition) break@loop } } — break@loop прерывает именно внешний цикл, а не внутренний, где он физически написан.",
    code: `outer@ for (i in 1..3) {
    for (j in 1..3) {
        if (i == 2 && j == 2) break@outer // прерывает ИМЕННО внешний цикл
        println("$i, $j")
    }
}

listOf(1, 2, 3).forEach lit@{ // метка для лямбды
    if (it == 2) return@lit // завершает только текущую итерацию forEach, а не всю функцию
    println(it)
}`
  },
  {
    id: "k37", cat: "kotlin", q: "Как работают partition и associateBy?",
    what: "Обе функции преобразуют коллекцию, но по-разному: partition разделяет её на ДВЕ группы по условию, а associateBy превращает список В Map по ключу.",
    key: "partition { condition } возвращает Pair из двух списков: первый — элементы, для которых условие true, второй — где false (в одну итерацию по коллекции, вместо двух отдельных filter). associateBy { keySelector } строит Map<K, T>, где ключ вычисляется из каждого элемента, а значением остаётся сам элемент — удобно для быстрого поиска по ID вместо линейного перебора списка.",
    example: "Частый практический кейс — вместо users.filter { it.isActive } и users.filter { !it.isActive } двумя отдельными проходами по списку используй один val (active, inactive) = users.partition { it.isActive }.",
    code: `val (adults, minors) = users.partition { it.age >= 18 }

val usersById = users.associateBy { it.id } // Map<Int, User> — быстрый доступ по id вместо O(n) поиска
val user = usersById[42] // O(1) вместо users.find { it.id == 42 }`
  },
  {
    id: "k38", cat: "kotlin", q: "Что такое Type Inference и чем отличается от Smart Cast?",
    what: "Type Inference (вывод типов) — способность компилятора САМОСТОЯТЕЛЬНО определить тип переменной или выражения по контексту, без явного указания типа разработчиком.",
    key: "Это происходит один раз, в момент ОБЪЯВЛЕНИЯ переменной/выражения (val x = 5 — компилятор выводит тип Int сразу при компиляции). Smart Cast — другая механика: сужение УЖЕ ИЗВЕСТНОГО типа переменной ПОСЛЕ явной проверки (is/null-проверки) внутри конкретного блока кода — это происходит не при объявлении, а в конкретной точке использования переменной, и может 'включаться/выключаться' в разных частях функции.",
    example: "Type Inference экономит явное указание типа (не нужно писать val x: Int = 5). Smart Cast экономит явное приведение типа (не нужно писать (x as String) после проверки is String) — это две разные, хоть и на первый взгляд похожие удобства компилятора.",
    code: `val number = 42          // Type Inference — компилятор сам понял, что это Int
val list = listOf(1, 2, 3) // Type Inference — List<Int>

fun process(x: Any) {
    if (x is String) {
        println(x.length) // Smart Cast — x трактуется как String именно в этой точке кода
    }
}`
  },
  {
    id: "k39", cat: "kotlin", q: "Чем модель исключений в Kotlin принципиально отличается от Java?",
    what: "Java разделяет исключения на checked (обязательно объявлять в сигнатуре через throws или ловить через try-catch) и unchecked (RuntimeException и потомки — необязательно). В Kotlin ВСЕ исключения — unchecked, разделения на checked/unchecked не существует вообще.",
    key: "Это осознанное решение дизайнеров Kotlin: практика показала, что в реальном Java-коде checked exceptions часто приводят к формальным пустым catch-блокам 'лишь бы скомпилировалось', а не к реальной обработке ошибок — то есть механика, задуманная для повышения надёжности, на практике часто снижает качество кода. Обратная сторона: компилятор Kotlin больше не подскажет тебе, что вызов функции может бросить исключение — приходится либо читать документацию/тело функции, либо явно проектировать API через Result/sealed-классы вместо надежды на исключения.",
    example: "При вызове Java-кода из Kotlin checked exceptions из Java по-прежнему могут долететь в рантайме — Kotlin просто не заставляет их ловить на этапе компиляции, но physически исключение никуда не девается.",
    code: null
  },

  {
    id: "j10", cat: "java", q: "Какие основные методы есть у класса Object и зачем они нужны?",
    what: "Object — корень иерархии классов в Java/Kotlin (в Kotlin — Any, но на уровне JVM в итоге всё сводится к Object); у него есть несколько методов, которые наследует буквально каждый класс.",
    key: "equals()/hashCode() — логическое сравнение объектов (см. отдельную карточку про их контракт). toString() — текстовое представление объекта для логов/отладки (по умолчанию — малополезная строка вида ClassName@hexhash, поэтому его почти всегда переопределяют). wait()/notify()/notifyAll() — низкоуровневая механика синхронизации потоков (метод должен вызываться внутри synchronized-блока на этом же объекте) — поток, вызвавший wait(), приостанавливается и освобождает монитор, пока другой поток не вызовет notify()/notifyAll() на том же объекте. finalize() — устаревший метод, вызываемый сборщиком мусора перед уничтожением объекта (не гарантирован по времени вызова, официально считается плохой практикой — вместо него используют try-with-resources/AutoCloseable в Java или функцию use{} в Kotlin).",
    example: "Практический совет: почти всегда стоит переопределять toString() для собственных классов данных, чтобы логи были читаемыми — хотя для data class в Kotlin это уже сделано за тебя автоматически.",
    code: null
  },
  {
    id: "j11", cat: "java", q: "Что такое String Pool и почему String в Java/Kotlin неизменяем (immutable)?",
    what: "String Pool¹ — специальная область памяти (часть кучи), где JVM хранит строковые ЛИТЕРАЛЫ (написанные прямо в коде), чтобы переиспользовать одинаковые строки вместо создания дубликатов.",
    key: "Когда ты пишешь val a = \"hello\", JVM сначала проверяет, есть ли уже такая строка в пуле — если да, переменная получает ссылку на СУЩЕСТВУЮЩИЙ объект, а не создаёт новый. Это работает только благодаря НЕИЗМЕНЯЕМОСТИ String — если бы строку можно было поменять после создания, изменение одной переменной незаметно поломало бы все остальные переменные, ссылающиеся на ту же самую переиспользуемую строку в пуле. Строки, созданные через конструктор (String(...)) или конкатенацию в рантайме, в пул НЕ попадают автоматически — только литералы (или явный вызов .intern()).",
    example: "Именно неизменяемость String — причина, по которой String идеально подходит как ключ HashMap: hashCode() строки можно закэшировать один раз при создании, зная, что содержимое никогда не поменяется.",
    code: `val a = "hello" // из String Pool
val b = "hello" // та же ссылка из пула — переиспользуется
val c = String("hello".toCharArray()) // НОВЫЙ объект, не из пула
println(a === b) // true — один и тот же объект
println(a === c) // false — разные объекты, хотя a == c (содержимое совпадает)`
  },
  {
    id: "j12", cat: "java", q: "StringBuilder vs StringBuffer — в чём разница?",
    what: "Оба — изменяемые (mutable) альтернативы неизменяемой String, позволяющие эффективно строить строку по частям без создания кучи промежуточных объектов на каждой конкатенации.",
    key: "StringBuffer — потокобезопасен (все его методы synchronized), но из-за этого медленнее. StringBuilder — НЕ потокобезопасен, зато заметно быстрее в однопоточном сценарии (нет накладных расходов на синхронизацию). Правило: если строка строится и используется только в одном потоке (99% реальных случаев в Android — например, сборка строки в одном методе) — используй StringBuilder; StringBuffer сегодня используется крайне редко.",
    example: "Каждая конкатенация обычных String через + внутри цикла на самом деле создаёт НОВЫЙ объект String на каждой итерации (из-за неизменяемости) — компилятор Kotlin/Java иногда сам оптимизирует это в StringBuilder под капотом, но в сложных случаях (циклы) лучше использовать StringBuilder явно.",
    code: `val sb = StringBuilder()
for (i in 1..1000) {
    sb.append(i).append(", ") // не создаёт 1000 промежуточных String-объектов
}
val result = sb.toString()`
  },
  {
    id: "j13", cat: "java", q: "Что такое рефлексия (reflection) и как её использовать?",
    what: "Рефлексия — механизм, позволяющий программе исследовать и изменять СВОЮ СОБСТВЕННУЮ структуру в рантайме: узнавать поля/методы класса, вызывать их по имени (даже приватные), создавать объекты без прямого вызова конструктора — всё это без того, чтобы знать точный тип на этапе компиляции.",
    key: "Плата за гибкость — производительность (рефлексия заметно медленнее прямого вызова кода) и потеря части безопасности типов на этапе компиляции (ошибки, которые обычно ловит компилятор, вылезают только в рантайме). Именно поэтому Serializable (использующий рефлексию) медленнее Parcelable (написанного вручную) — мы уже разбирали это в карточке про Android.",
    example: "Библиотеки вроде Gson/Retrofit/Room активно используют рефлексию под капотом, чтобы автоматически превращать JSON в объекты твоих классов, не требуя от тебя писать маппинг руками для каждого поля.",
    code: `val kClass = MyClass::class
kClass.members.forEach { println(it.name) } // список всех методов/свойств в рантайме

val instance = kClass.constructors.first().call() // создание объекта через рефлексию`
  },
  {
    id: "j14", cat: "java", q: "Как передаются параметры в функции — по ссылке или по значению?",
    what: "В Java и Kotlin ВСЕ параметры передаются строго по значению (pass by value) — важно понимать, что именно копируется в разных случаях.",
    key: "Для примитивов (Int, Boolean и т.д.) копируется само значение — изменение параметра внутри функции никак не влияет на переменную снаружи. Для объектов копируется ЗНАЧЕНИЕ ССЫЛКИ на объект (а не сам объект) — поэтому если внутри функции изменить ПОЛЯ объекта через эту ссылку, изменение будет видно снаружи (объект-то один и тот же в памяти), но если внутри функции ПЕРЕПРИСВОИТЬ саму переменную-параметр на новый объект — снаружи это не будет заметно, потому что переприсвоилась только локальная копия ссылки.",
    example: "Частая путаница на собесе: 'раз объекты передаются по ссылке — значит, можно поменять сам объект снаружи, переприсвоив параметр внутри функции' — это неверно, именно потому что копируется ЗНАЧЕНИЕ ссылки, а не сама переменная-ссылка снаружи.",
    code: `fun tryReassign(user: User) {
    user.name = "Изменено" // видно снаружи — меняем ПОЛЕ существующего объекта через скопированную ссылку
    // user = User("Другой") — не скомпилируется (val-параметр), но даже если var — снаружи это не будет видно
}`
  },
  {
    id: "j15", cat: "java", q: "Hashtable vs HashMap vs ConcurrentHashMap — когда что использовать?",
    what: "Три реализации Map с разным подходом к многопоточности.",
    key: "Hashtable — устаревшая, полностью synchronized на уровне всей структуры (каждая операция блокирует ВСЮ таблицу целиком) — потокобезопасна, но очень медленная под нагрузкой, сегодня практически не используется. HashMap — НЕ потокобезопасен вообще, но самый быстрый в однопоточном сценарии; при одновременном изменении из нескольких потоков поведение непредсказуемо (вплоть до бесконечного цикла в старых версиях Java при resize). ConcurrentHashMap — современное решение: потокобезопасен, но использует блокировку не на всю структуру целиком, а на отдельные сегменты (segment locking¹) — конкурентные операции над РАЗНЫМИ частями таблицы не блокируют друг друга, что даёт кардинально лучшую производительность под многопоточной нагрузкой, чем Hashtable.",
    example: "Правило: HashMap — для однопоточного доступа (в том числе доступ только из главного потока Android). ConcurrentHashMap — если реально несколько потоков одновременно читают/пишут в общую мапу. Hashtable сегодня не выбирают вообще, он остался только для legacy-совместимости.",
    code: null
  },
  {
    id: "j16", cat: "java", q: "Fail-fast vs fail-safe итераторы — в чём разница?",
    what: "Оба описывают поведение итератора¹, когда КОЛЛЕКЦИЯ изменяется прямо во время итерации по ней.",
    key: "Fail-fast (итераторы ArrayList, HashMap и большинства стандартных коллекций) — немедленно бросают ConcurrentModificationException, если обнаруживают, что коллекция была изменена НЕ через сам итератор во время обхода — это защитный механизм для раннего обнаружения багов в многопоточном или неаккуратном коде. Fail-safe (например, итераторы CopyOnWriteArrayList или ConcurrentHashMap) — работают с КОПИЕЙ данных на момент начала итерации (или со снапшотом), поэтому не бросают исключение при параллельном изменении оригинала, но зато итератор может не увидеть изменения, произошедшие после начала обхода.",
    example: "Частая ошибка новичков — удаление элемента из ArrayList прямо внутри for-each цикла по нему напрямую (list.remove(item)) — вызывает ConcurrentModificationException; правильно — использовать iterator.remove() или отдельную коллекцию для накопления того, что нужно удалить.",
    code: `val list = mutableListOf(1, 2, 3, 4)
val iterator = list.iterator()
while (iterator.hasNext()) {
    val value = iterator.next()
    if (value == 2) iterator.remove() // безопасно — через сам итератор
    // list.remove(value) — бросило бы ConcurrentModificationException
}`
  },
  {
    id: "j17", cat: "java", q: "Deadlock vs Livelock — в чём разница между этими двумя видами взаимной блокировки?",
    what: "Оба описывают ситуацию, когда несколько потоков не могут продвинуться дальше, но по-разному 'выглядят изнутри'.",
    key: "Deadlock (взаимная блокировка) — потоки полностью ЗАСТЫВАЮТ, каждый ждёт ресурс, занятый другим, никакой активности не происходит вообще (мы разбирали это подробно в карточке про Concurrency). Livelock — потоки НЕ заблокированы физически, они активно ЧТО-ТО ДЕЛАЮТ (меняют состояние, отвечают друг другу), но система в целом не продвигается к завершению — как два человека в узком коридоре, одновременно уступающих друг другу дорогу и раз за разом синхронно шагающих в одну и ту же сторону.",
    example: "Типичный сценарий livelock — алгоритм 'вежливой' обработки конфликта (поток A видит, что поток B занят ресурсом, и отступает, чтобы не мешать; поток B делает то же самое одновременно) — оба вечно отступают синхронно, реального прогресса нет.",
    code: null
  },
  {
    id: "j18", cat: "java", q: "Что такое ThreadPoolExecutor и почему пул потоков эффективнее ручного создания Thread?",
    what: "ThreadPoolExecutor — управляемый пул заранее созданных потоков, между которыми распределяются поступающие задачи, вместо создания нового потока под каждую отдельную задачу.",
    key: "Создание реального системного потока — дорогая операция (выделение памяти под стек потока, системные вызовы ОС) — если создавать новый Thread на каждую мелкую задачу, накладные расходы на создание/уничтожение потоков могут превысить время самой полезной работы. Пул решает это, переиспользуя уже созданные потоки: задача попадает в очередь, свободный поток из пула её забирает, выполняет и возвращается ждать следующую задачу — без повторного создания системного потока с нуля.",
    example: "Именно на ThreadPoolExecutor построены Dispatchers.IO и Dispatchers.Default в Kotlin Coroutines — сами корутины лёгкие, но реальное выполнение suspend-кода в конечном счёте происходит на потоках из управляемого пула.",
    code: null
  },
  {
    id: "j19", cat: "java", q: "Как работает static-блок инициализации и можно ли переопределить static-метод?",
    what: "static-блок — код внутри класса, который выполняется РОВНО ОДИН РАЗ, в момент первой загрузки класса JVM (до создания любого экземпляра и до обращения к любым static-полям класса).",
    key: "static-методы НЕЛЬЗЯ переопределить в классическом полиморфном смысле (через override) — если в подклассе объявить static-метод с тем же именем, это называется 'скрытие' (hiding), а не переопределение: какой метод вызовется, решается статически по ТИПУ ССЫЛКИ во время компиляции, а не по реальному классу объекта в рантайме (в отличие от обычных виртуальных методов).",
    example: "В Kotlin прямого аналога static нет — вместо этого используют companion object (см. отдельную карточку) или top-level функции файла, которые компилируются похожим образом.",
    code: null
  },
  {
    id: "j20", cat: "java", q: "Что делает модификатор transient?",
    what: "transient помечает поле класса как ИСКЛЮЧАЕМОЕ из стандартной Java-сериализации (Serializable) — при сохранении объекта в поток байт это поле просто пропускается, а при десериализации получает значение по умолчанию (null/0/false).",
    key: "Типичное применение — поля, которые либо содержат чувствительные данные (пароли, токены — не хотим случайно сохранить их на диск вместе с остальным объектом), либо просто не имеют смысла после восстановления (например, ссылка на Thread или соединение с сетью — эти объекты всё равно нельзя корректно сериализовать/восстановить).",
    example: "transient актуален именно для Serializable — если проект использует Parcelable (что рекомендуется в Android), там разработчик сам явно решает, какие поля писать в Parcel, поэтому transient там не нужен в принципе.",
    code: `class Session : Serializable {
    val userId: String = ""
    @Transient var authToken: String? = null // не попадёт в сериализованный поток
}`
  },
  {
    id: "j21", cat: "java", q: "final vs finally vs finalize — три похожих слова с разным смыслом",
    what: "Три термина, которые часто путают из-за похожего звучания, но они относятся к абсолютно разным механикам языка.",
    key: "final — модификатор: класс нельзя унаследовать, метод нельзя переопределить, переменную нельзя переприсвоить после инициализации. finally — блок в конструкции try/catch/finally, который выполняется ВСЕГДА после try (успешно или нет), обычно используется для освобождения ресурсов. finalize() — устаревший метод класса Object, вызываемый сборщиком мусора перед уничтожением объекта (см. карточку про методы Object) — сегодня считается плохой практикой, используй try-with-resources/use{} вместо него.",
    example: "Хороший мнемонический приём для запоминания: final — про 'неизменность объявления', finally — про 'обязательное завершение блока кода', finalize — про 'обязанности перед уничтожением объекта' (хоть и ненадёжные на практике).",
    code: null
  },
  {
    id: "j22", cat: "java", q: "throw vs throws — в чём разница?",
    what: "Два похожих ключевых слова для абсолютно разных задач, связанных с исключениями.",
    key: "throw — оператор, который РЕАЛЬНО ВЫБРАСЫВАЕТ конкретный экземпляр исключения в конкретной точке кода (throw IllegalStateException(\"...\")). throws — используется в СИГНАТУРЕ метода в Java (throws IOException), чтобы объявить, что метод МОЖЕТ выбросить это исключение, и вызывающий код обязан либо поймать его, либо тоже объявить throws дальше — это часть механики checked exceptions, которой, как мы уже разбирали, в Kotlin вообще нет.",
    example: "В Kotlin ключевое слово throws не нужно (нет checked exceptions), но при взаимодействии с Java-кодом можно встретить его в сигнатурах вызываемых Java-методов.",
    code: null
  },
  {
    id: "j23", cat: "java", q: "Comparable vs Comparator — в чём разница и когда что реализовывать?",
    what: "Оба используются для определения порядка сортировки объектов, но с разной степенью гибкости.",
    key: "Comparable — интерфейс, который реализует САМ КЛАСС, задавая ЕДИНСТВЕННЫЙ 'естественный порядок' сравнения (метод compareTo) — например, числа сравниваются по значению, строки — по алфавиту. Comparator — ОТДЕЛЬНЫЙ объект-компаратор, который можно передать в функцию сортировки (sortedWith) СНАРУЖИ, не трогая сам класс — позволяет иметь СКОЛЬКО УГОДНО разных способов сортировки одного и того же класса, в зависимости от контекста.",
    example: "Правило выбора: если у класса есть одно очевидное 'естественное' сравнение (числа, даты) — Comparable. Если нужно сортировать по-разному в разных местах приложения (по имени, по возрасту, по дате регистрации) — отдельные Comparator для каждого случая.",
    code: `data class User(val name: String, val age: Int) : Comparable<User> {
    override fun compareTo(other: User) = this.age - other.age // естественный порядок — по возрасту
}

val byName = Comparator<User> { a, b -> a.name.compareTo(b.name) } // альтернативный порядок — по имени
users.sorted()               // использует Comparable (по возрасту)
users.sortedWith(byName)     // использует конкретный Comparator (по имени)`
  },
  {
    id: "j24", cat: "java", q: "Queue (FIFO) vs Stack (LIFO) — и сколько стеков вызовов существует в одном процессе?",
    what: "Две базовые структуры данных с противоположным порядком извлечения элементов.",
    key: "Queue — FIFO¹ (First In, First Out): элемент, добавленный первым, извлекается первым (как очередь в магазине). Stack — LIFO² (Last In, First Out): последний добавленный элемент извлекается первым (как стопка тарелок). Важный практический факт: стек вызовов (call stack) — ОТДЕЛЬНЫЙ у КАЖДОГО ПОТОКА в процессе, а не один общий на весь процесс — именно поэтому у каждого потока своя независимая глубина рекурсии и свой StackOverflowError, не влияющий на другие потоки.",
    example: "MessageQueue из карточки про Handler/Looper — это именно Queue (FIFO): сообщения обрабатываются в том порядке, в котором были отправлены, а не в обратном.",
    code: null
  },
  {
    id: "j25", cat: "java", q: "Что такое Race Condition и чем он принципиально отличается от Deadlock?",
    what: "Race Condition (состояние гонки) — ситуация, когда РЕЗУЛЬТАТ работы программы непредсказуемо зависит от того, В КАКОМ ПОРЯДКЕ несколько потоков успеют выполнить операции над общими данными.",
    key: "Ключевое отличие от Deadlock: при Race Condition потоки НЕ блокируются и не зависают — программа продолжает выполняться и даже завершается, просто результат может оказаться неверным (например, счётчик, инкрементируемый из двух потоков без синхронизации, в итоге покажет меньше ожидаемого значения, потому что операция count++ не атомарна и потоки 'затирают' изменения друг друга). Deadlock — потоки полностью останавливаются. Решение Race Condition — синхронизация доступа (synchronized/Mutex/Atomic-типы), а не избегание захвата ресурсов, как при deadlock.",
    example: "Классический пример на собесе: два потока одновременно читают текущее значение count (допустим, 5), оба независимо прибавляют 1 и записывают 6 обратно — хотя логически должно было получиться 7 (два инкремента), реально получилось только 6, потому что чтение+запись не было атомарным.",
    code: null
  },

  {
    id: "j26", cat: "java", q: "synchronized, volatile и Atomic-типы — три инструмента многопоточности Java, в чём разница между ними?",
    what: "Все три решают проблемы совместного доступа к данным из нескольких потоков, но на РАЗНОМ уровне и для разных задач — на собесе часто просят не просто определения, а объяснить, почему нельзя обойтись одним из них вместо остальных.",
    key: "synchronized — блокировка целого блока кода/метода через монитор объекта (см. отдельную карточку в Concurrency): гарантирует, что внутри блока в любой момент времени только один поток, и заодно даёт видимость изменений другим потокам после выхода из блока — самый 'тяжёлый', но самый универсальный инструмент. volatile — НЕ блокирует ничего, только гарантирует видимость (visibility) изменений одной конкретной переменной между потоками и запрещает переупорядочивание вокруг неё — не даёт атомарности составных операций (count++ всё равно небезопасен). Atomic-типы (AtomicInteger, AtomicReference и т.д.) — дают атомарность КОНКРЕТНОЙ операции (инкремент, compare-and-swap) БЕЗ блокировки потока вообще, используя низкоуровневые атомарные инструкции процессора — быстрее synchronized для простых случаев вроде счётчиков, но не годятся для защиты сложной последовательности из нескольких связанных операций.",
    example: "Практическое правило выбора: нужен просто флаг-сигнал между потоками (без составных операций) → volatile. Нужен потокобезопасный счётчик или простое значение с атомарным обновлением → Atomic-тип. Нужно защитить сложный блок логики с несколькими шагами → synchronized (или Mutex в мире корутин).",
    code: `class Counter {
    @Volatile var isRunning = true // просто флаг — volatile достаточно

    private val count = AtomicInteger(0)
    fun increment() = count.incrementAndGet() // атомарная операция без блокировки

    private val lock = Any()
    private var complexState = mutableListOf<Int>()
    fun addComplex(value: Int) = synchronized(lock) {
        complexState.add(value) // несколько шагов логики — нужна полноценная блокировка
    }
}`
  },

  {
    id: "cx6", cat: "compose", q: "remember vs rememberSaveable — в чём разница и когда remember 'теряет' состояние?",
    what: "Обе функции сохраняют значение между рекомпозициями¹ (повторными вызовами Composable-функции при изменении состояния), но переживают РАЗНЫЕ типы пересоздания экрана.",
    key: "remember сохраняет значение только пока сама композиция² жива — переживает обычные рекомпозиции, но ТЕРЯЕТ значение при пересоздании Activity/пересоздании всей композиции целиком (например, при повороте экрана, если Activity не сконфигурирована на сохранение конфигурации). rememberSaveable дополнительно сохраняет значение через Bundle (тот же механизм, что onSaveInstanceState) — переживает и поворот экрана, и даже смерть процесса, но ограничен простыми типами (примитивы, String, Parcelable) — сложные объекты требуют @Parcelize или явного Saver (MapSaver/ListSaver).",
    example: "Правило выбора: временное UI-состояние, которое не жалко потерять при повороте (например, раскрыт ли dropdown) — remember. Данные, введённые пользователем, которые жалко терять (текст в поле поиска) — rememberSaveable.",
    code: `@Composable
fun SearchScreen() {
    var isExpanded by remember { mutableStateOf(false) } // ОК потерять при повороте
    var query by rememberSaveable { mutableStateOf("") } // жалко терять ввод пользователя
}`
  },
  {
    id: "cx7", cat: "compose", q: "Какие есть фазы у Compose (Composition, Layout, Draw) и могут ли они пропускаться?",
    what: "Compose обрабатывает каждый кадр в три последовательные фазы, которые вместе превращают описание UI в реальные пиксели на экране.",
    key: "Composition — вызываются Composable-функции, строится/обновляется дерево UI-элементов на основе текущего состояния. Layout — для каждого элемента вычисляются размеры и позиция (аналог onMeasure/onLayout в классическом View-подходе). Draw — элементы реально отрисовываются на экране (аналог onDraw). Важный нюанс для оптимизации: каждая фаза МОЖЕТ быть пропущена для конкретного элемента, если Compose определит, что изменение состояния не затрагивает именно эту фазу (например, изменение цвета не требует пересчёта Layout — только Draw).",
    example: "Именно поэтому важна стабильность типов (карточка про @Stable/@Immutable) — если Compose не может доказать, что данные не изменились, он не сможет пропустить лишние фазы, и будет пересчитывать даже то, что реально не поменялось.",
    code: null
  },
  {
    id: "cx8", cat: "compose", q: "Зачем нужен параметр key в LazyColumn/items() и что будет при дублирующихся ключах?",
    what: "key — уникальный идентификатор каждого элемента списка, который Compose использует, чтобы отследить, какой именно элемент переместился, изменился или исчез при обновлении списка — аналог того, зачем DiffUtil нужен ID элемента в RecyclerView.",
    key: "Без key Compose ассоциирует состояние элемента с его ПОЗИЦИЕЙ в списке — если список переупорядочился (например, добавили элемент в начало), Compose может 'перепутать', какому элементу принадлежит какое внутреннее состояние (позиция скролла внутри элемента, анимация и т.д.), что приводит к визуальным глюкам. С key Compose отслеживает элемент по ЕГО ЛОГИЧЕСКОМУ идентификатору независимо от позиции в списке.",
    example: "Если передать одинаковый key нескольким элементам одновременно — Compose не сможет корректно их различить, и результат будет непредсказуемым (обычно крашем или явным сообщением об ошибке в логах, в зависимости от версии).",
    code: `LazyColumn {
    items(messages, key = { message -> message.id }) { message -> // используем ID, а не позицию
        MessageRow(message)
    }
}`
  },
  {
    id: "cx9", cat: "compose", q: "Что такое SnapshotFlow и SnapshotStateList?",
    what: "Оба — 'мосты' между реактивной системой состояния Compose (Snapshot¹ — механизм отслеживания изменений State) и обычными Kotlin-инструментами (Flow, коллекции).",
    key: "snapshotFlow {} превращает ЛЮБОЕ Compose State в обычный Flow — полезно, когда нужно среагировать на изменение состояния через привычные операторы Flow (debounce, distinctUntilChanged) вместо side-effect API вроде LaunchedEffect. SnapshotStateList<T> — реализация MutableList, интегрированная со Snapshot-системой Compose: изменения списка (add/remove) автоматически триггерят рекомпозицию тех Composable, которые его читают, в отличие от обычного MutableList, изменения которого Compose не отследит.",
    example: "Частая ошибка новичков — хранить список как обычный `mutableStateOf(mutableListOf(...))` и потом менять его через `.add()` напрямую: Compose не увидит изменение, потому что сама ССЫЛКА на список не поменялась. Решение — `mutableStateListOf()` (создаёт SnapshotStateList) вместо обычного MutableList.",
    code: `val items = remember { mutableStateListOf<String>() } // отслеживается Compose автоматически
items.add("новый элемент") // триггерит рекомпозицию сам по себе

LaunchedEffect(Unit) {
    snapshotFlow { scrollState.value } // превращаем State в Flow
        .debounce(300)
        .collect { position -> /* реагируем на скролл с задержкой */ }
}`
  },
  {
    id: "cx10", cat: "compose", q: "Что такое FlowRow и FlowColumn?",
    what: "Компоненты, автоматически переносящие дочерние элементы на новую строку (FlowRow) или колонку (FlowColumn), когда не хватает места в текущей — аналог CSS flex-wrap из веб-разработки.",
    key: "В отличие от обычного Row/Column (где все элементы вынуждены помещаться в одну строку/колонку, вылезая за экран, если не хватает места), FlowRow/FlowColumn сами решают, сколько элементов помещается в одну 'линию', и переносят оставшиеся дальше — не нужно вручную считать, сколько элементов влезет.",
    example: "Классический кейс использования — облако тегов/чипов (например, список категорий или хэштегов) с заранее неизвестным количеством элементов и разной длиной текста в каждом.",
    code: `FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
    tags.forEach { tag -> Chip(text = tag) } // сами перенесутся на новую строку при нехватке места
}`
  },
  {
    id: "cx11", cat: "compose", q: "Что такое CompositionLocal и зачем он нужен?",
    what: "Механизм передачи данных ВНИЗ по дереву композиции без необходимости явно прокидывать параметр через КАЖДЫЙ промежуточный уровень вложенности (избегание так называемого prop drilling¹).",
    key: "Данные, объявленные через CompositionLocal, доступны любому Composable-потомку через .current, независимо от того, насколько глубоко он вложен — идеально для действительно 'сквозных' вещей вроде темы оформления, локализации, текущего Context. Важно не злоупотреблять этим механизмом для обычных данных экрана (это скрывает явные зависимости компонента, что нарушает прозрачность кода) — CompositionLocal предназначен именно для окружения/конфигурации, а не для передачи бизнес-данных.",
    example: "LocalContext.current — самый частый практический пример: доступ к Android Context из любого места дерева Composable без явной передачи параметром через каждый уровень.",
    code: `val LocalUserTheme = compositionLocalOf { defaultTheme } // объявление

@Composable
fun App() {
    CompositionLocalProvider(LocalUserTheme provides customTheme) {
        DeepChildScreen() // где угодно внутри можно взять LocalUserTheme.current
    }
}`
  },
  {
    id: "cx12", cat: "compose", q: "Как работает система Modifier и почему порядок в цепочке важен?",
    what: "Modifier — способ 'настроить' Composable (отступы, размер, обработка кликов, фон) БЕЗ изменения кода самого компонента — цепочка модификаторов применяется последовательно, каждый оборачивая предыдущий результат.",
    key: "Порядок вызовов в цепочке критически важен, потому что каждый Modifier применяется к результату ПРЕДЫДУЩЕГО, а не к исходному компоненту напрямую: Modifier.padding(16.dp).background(Color.Red) даст красный фон БЕЗ отступа снаружи (фон рисуется уже после того, как добавлен отступ, то есть внутри отступа), а Modifier.background(Color.Red).padding(16.dp) даст красный фон, включающий область отступа.",
    example: "Частый баг у новичков — перепутанный порядок padding/background/clickable, из-за которого кликабельная область или фон визуально не совпадают с ожиданием.",
    code: `Box(Modifier.padding(16.dp).background(Color.Red)) // отступ СНАРУЖИ красного фона
Box(Modifier.background(Color.Red).padding(16.dp))   // отступ ВНУТРИ красного фона — по-другому выглядит`
  },
  {
    id: "cx13", cat: "compose", q: "Как работает mutableStateOf и почему именно он запускает перерисовку?",
    what: "mutableStateOf создаёt объект типа MutableState<T> — реализацию паттерна Наблюдатель¹ (Observer), где Compose 'подписывается' на чтение значения внутри Composable-функции и автоматически перезапускает её при изменении.",
    key: "Механизм основан на Snapshot-системе Compose: когда Composable-функция ЧИТАЕТ .value у State во время своего выполнения, среда исполнения Compose незаметно 'запоминает', что эта функция зависит от этого конкретного State. Когда позже кто-то ЗАПИСЫВАЕТ новое значение в тот же State, Compose точно знает, какие именно Composable-функции нужно перезапустить (рекомпозировать) — не весь экран целиком, а только реально зависящие от изменившегося значения.",
    example: "Именно за счёт этого 'умного' отслеживания зависимостей Compose может пропускать рекомпозицию огромных частей дерева, если они не читают изменившийся State — прямая причина, почему Compose в теории эффективнее, чем полный re-render всего экрана.",
    code: `val counter = remember { mutableStateOf(0) } // Compose 'следит' за счётчиком
Text("Count: \${counter.value}") // при чтении .value здесь — регистрируется зависимость
Button(onClick = { counter.value++ }) { Text("+1") } // запись триггерит рекомпозицию Text выше`
  },
  {
    id: "cx14", cat: "compose", q: "Что именно запускает рекомпозицию — и почему она может произойти чаще, чем ожидается?",
    what: "Рекомпозиция запускается, когда Compose обнаруживает, что значение ХОТЯ БЫ ОДНОГО State, прочитанного внутри Composable-функции во время предыдущего выполнения, реально изменилось.",
    key: "'Реально изменилось' проверяется через сравнение по equals() — если новое значение равно старому по содержимому, рекомпозиция для СТАБИЛЬНЫХ (см. карточку про @Stable/@Immutable) типов не запускается вообще. Частая причина ЛИШНИХ рекомпозиций — передача НЕСТАБИЛЬНОГО типа (обычный интерфейс List, лямбда без remember, объект без @Immutable) в параметрах Composable-функции: Compose не может доказать, что параметр не изменился, и на всякий случай перезапускает функцию заново при КАЖДОЙ рекомпозиции родителя, даже если реальные данные те же самые.",
    example: "Классическая ошибка — передавать в Composable лямбду, создаваемую заново на каждой рекомпозиции родителя (например, onClick = { doSomething(item) } без remember) — это заставляет Compose считать параметр 'новым' каждый раз, вызывая избыточные рекомпозиции дочернего компонента.",
    code: null
  },
  {
    id: "cx15", cat: "compose", q: "Что такое BoxWithConstraints и когда он нужен?",
    what: "BoxWithConstraints — аналог обычного Box, но дополнительно даёт доступ к реальным ограничениям (maxWidth, maxHeight и т.д.) от родителя ВНУТРИ своего content-блока, ещё до того, как контент будет размещён.",
    key: "Обычный Composable узнаёт свои размеры только ПОСЛЕ измерения (например, через Modifier.onSizeChanged, уже постфактум). BoxWithConstraints позволяет принять решение О ТОМ, ЧТО РИСОВАТЬ, ЗАРАНЕЕ, основываясь на доступном пространстве — то есть адаптивная вёрстка (показать компактную версию карточки на маленьком экране, полную — на большом) становится возможной без лишнего кадра перерисовки.",
    example: "Практический кейс — адаптивный layout, который на планшете показывает список и детали рядом (Master-Detail), а на телефоне — только список, в зависимости от maxWidth.",
    code: `@Composable
fun AdaptiveLayout() = BoxWithConstraints {
    if (maxWidth < 600.dp) CompactView() else MasterDetailView() // решение принято заранее, до отрисовки
}`
  },
  {
    id: "cx16", cat: "compose", q: "Как работает низкоуровневый Layout и когда нужен SubcomposeLayout?",
    what: "Layout — базовый строительный блок Compose для создания СВОЕЙ собственной стратегии измерения и позиционирования дочерних элементов, когда встроенных Row/Column/Box недостаточно для нужной вёрстки.",
    key: "Layout получает список measurables (ещё не измеренных дочерних элементов) и constraints (ограничения от родителя), сам решает, как их измерить (measure()) и разместить (place()) — это тот же уровень абстракции, что onMeasure/onLayout в классическом View-подходе, только в декларативном стиле. SubcomposeLayout — более продвинутый вариант, позволяющий компоновать ЧАСТЬ дочерних элементов ПОЗЖЕ, уже зная размеры других частей — нужен, когда контент одного элемента логически зависит от итогового размера другого (обычный Layout так не умеет, потому что все дети измеряются заранее одним проходом).",
    example: "SubcomposeLayout используют для сложных кейсов вроде значка-бейджа, позиция которого зависит от итогового размера основного контента, который сам ещё не был вычислен на момент начала компоновки бейджа.",
    code: null
  },
  {
    id: "cx17", cat: "compose", q: "Что такое Composer и что компилятор неявно передаёт во все @Composable-функции?",
    what: "Composer — служебный объект, который компилятор Compose АВТОМАТИЧЕСКИ добавляет скрытым параметром к КАЖДОЙ функции, помеченной @Composable, хотя разработчик никогда явно его не пишет и не видит в своём коде.",
    key: "Через Composer Compose-рантайм отслеживает структуру дерева композиции, регистрирует зависимости от State (см. карточку про mutableStateOf) и решает, какие части нужно перерисовать. Именно поэтому Composable-функции нельзя вызывать из обычных, не-Composable функций — у обычной функции просто нет доступа к неявному параметру Composer, который нужен для работы всей системы.",
    example: "Это объясняет ограничение 'Composable функция может быть вызвана только из другого Composable' — оно не искусственное, а прямое следствие того, как реализована передача Composer под капотом компилятором.",
    code: null
  },
  {
    id: "cx18", cat: "compose", q: "rememberCoroutineScope vs LaunchedEffect — когда использовать какой?",
    what: "Оба дают доступ к CoroutineScope для запуска корутин из Composable-функции, но с разной моделью запуска.",
    key: "LaunchedEffect ЗАПУСКАЕТ корутину автоматически при входе в композицию (или при смене переданного ключа) — подходит, когда корутину нужно запустить как РЕАКЦИЮ на появление экрана или изменение данных. rememberCoroutineScope просто ВОЗВРАЩАЕТ scope, привязанный к жизненному циклу композиции, но САМ НИЧЕГО не запускает — используется, когда корутину нужно стартовать в ответ на ДЕЙСТВИЕ ПОЛЬЗОВАТЕЛЯ (например, клик по кнопке), а не автоматически при появлении экрана — из обработчика клика (обычная не-suspend лямбда) нельзя напрямую вызвать LaunchedEffect.",
    example: "Правило: 'сама срабатывает при появлении' → LaunchedEffect. 'Запускаю вручную по клику' → rememberCoroutineScope + scope.launch { ... } внутри onClick.",
    code: `@Composable
fun Screen() {
    val scope = rememberCoroutineScope()
    LaunchedEffect(Unit) { loadInitialData() } // авто-запуск при появлении экрана

    Button(onClick = {
        scope.launch { saveData() } // запуск по клику — вручную, из обработчика
    }) { Text("Сохранить") }
}`
  },

  {
    id: "a23", cat: "android", q: "Какие 4 базовых компонента есть у Android-приложения?",
    what: "Android Framework строится вокруг четырёх типов компонентов — это 'точки входа', через которые система может запустить часть твоего приложения, даже если само приложение сейчас не запущено пользователем.",
    key: "Activity — один экран пользовательского интерфейса. Service — выполнение работы без интерфейса (в фоне). BroadcastReceiver — приёмник системных или кастомных широковещательных сообщений. ContentProvider — безопасный обмен структурированными данными между приложениями. Все четыре объединяет то, что их может создать и вызвать СИСТЕМА (а не только твой собственный код) — именно поэтому все они должны быть объявлены в AndroidManifest.xml (кроме динамически регистрируемых BroadcastReceiver), чтобы система знала об их существовании.",
    example: "Fragment НЕ считается пятым компонентом системы — это чисто прикладная концепция уровня Android SDK (Jetpack), а не часть базовой архитектуры ОС: фрагмент не может существовать без Activity и не запускается системой напрямую.",
    code: null
  },
  {
    id: "a24", cat: "android", q: "Что описывает AndroidManifest.xml и зачем он вообще нужен системе?",
    what: "AndroidManifest.xml — обязательный XML-файл в корне каждого Android-приложения, который служит своего рода 'паспортом' приложения для операционной системы.",
    key: "В нём объявляются: все 4 компонента приложения (иначе система физически не сможет их запустить — не будет о них знать), запрашиваемые разрешения (permissions), минимальная и целевая версия Android, иконка и название приложения, а также intent-filter'ы — правила, описывающие, НА КАКИЕ намерения (Intent) способен реагировать конкретный компонент. Именно через intent-filter с action=MAIN и category=LAUNCHER система понимает, какую Activity показать при тапе на иконку приложения на рабочем столе.",
    example: "Если забыть объявить Activity в манифесте, попытка её запустить (startActivity) упадёт с ActivityNotFoundException в рантайме — компилятор эту ошибку не поймает, потому что манифест не проверяется на этапе компиляции кода так строго, как обычный Kotlin-код.",
    code: null
  },
  {
    id: "a25", cat: "android", q: "Activity Context vs Application Context — детальное сравнение и когда каждый уместен",
    what: "Оба являются реализациями Context, но отличаются временем жизни и тем, к чему дают доступ.",
    key: "Application Context живёт ровно столько, сколько живёт весь процесс приложения (создаётся один раз при старте, уничтожается только при полном закрытии процесса) — безопасен для долгоживущих объектов (синглтоны, репозитории), потому что не может 'протечь' вместе с уничтоженным экраном. Activity Context привязан к конкретному экрану и уничтожается вместе с ним — обязателен для всего, что связано с UI и темами (инфлейт разметки, показ диалогов, доступ к ресурсам темы), потому что у Application Context НЕТ полноценной темы оформления (Theme) — попытка инфлейтить View через Application Context может визуально сломать стили элементов.",
    example: "Практическое правило: если объект переживёт саму Activity (Singleton-репозиторий, DI-граф уровня приложения) — используй Application Context. Если работаешь с UI прямо сейчас (диалог, инфлейт вью, доступ к теме) — обязательно Activity Context, иначе получишь либо утечку памяти (в первом случае), либо визуальный баг с темой (во втором).",
    code: null
  },
  {
    id: "a26", cat: "android", q: "Можно ли показать несколько экземпляров одного приложения в списке недавних (Recents)?",
    what: "По умолчанию Android показывает в списке недавних задач (Recents/Overview) один 'таск' на приложение, но при необходимости можно настроить показ НЕСКОЛЬКИХ независимых экземпляров одного и того же приложения одновременно.",
    key: "Это управляется через launch-режим документов (documentLaunchMode в манифесте Activity) — например, значение 'always' заставляет систему создавать новую отдельную запись в Recents при каждом новом запуске такой Activity с новым Intent, даже если это технически 'то же самое' приложение.",
    example: "Практический пример — приложения для работы с документами (аналог многооконных офисных приложений): каждый открытый документ может отображаться как отдельная карточка в Recents, будто это отдельное приложение, хотя физически это одно и то же приложение.",
    code: null
  },
  {
    id: "a27", cat: "android", q: "Когда может вызваться onPause() без последующего onStop()?",
    what: "Обычно порядок жизненного цикла строго последователен (onPause обычно предшествует onStop, если Activity полностью скрывается), но есть сценарий, где onStop НЕ вызывается сразу после onPause.",
    key: "Это происходит, когда Activity остаётся ЧАСТИЧНО ВИДИМОЙ — например, когда поверх неё появляется полупрозрачный диалог, или новая Activity с прозрачной темой, или всплывающее системное окно (typа выбор приложения для Intent). В этом случае система вызывает onPause() (Activity больше не в фокусе ввода), но НЕ вызывает onStop(), потому что Activity технически всё ещё частично видна пользователю.",
    example: "Практическое следствие для собеса: если в onPause() выполнять тяжёлую логику 'на всякий случай, вдруг Activity скрывается полностью' — это может срабатывать намного чаще, чем реальное скрытие экрана (например, при каждом системном диалоге разрешений), поэтому тяжёлую логику лучше держать именно в onStop().",
    code: null
  },
  {
    id: "a28", cat: "android", q: "Что такое Activity State Loss Exception и зачем нужен commitAllowingStateLoss()?",
    what: "Если попытаться сделать commit() транзакции FragmentManager ПОСЛЕ того, как система уже сохранила состояние Activity (onSaveInstanceState уже был вызван — например, приложение свёрнуто в фон), система бросает IllegalStateException, защищая тебя от потери данных о фрагментах при возможном восстановлении Activity.",
    key: "commitAllowingStateLoss() — та же транзакция, но БЕЗ этой защиты: она выполнится, даже если состояние уже сохранено, но система честно предупреждает — если Activity действительно будет восстановлена системой из сохранённого состояния (например, после смерти процесса в фоне), эта транзакция может 'потеряться' и не восстановится. Использовать стоит только тогда, когда потеря состояния фрагмента в этом редком сценарии реально приемлема для UX.",
    example: "Частый практический кейс — асинхронный колбэк (например, результат сетевого запроса), который может прийти ПОСЛЕ того, как пользователь уже свернул приложение — если в этот момент нужно показать фрагмент с результатом, обычный commit() упадёт с исключением, и приходится выбирать между commitAllowingStateLoss() или просто игнорировать результат, если Activity уже не видна.",
    code: null
  },
  {
    id: "a29", cat: "android", q: "Что такое проблема 64K методов, MultiDex и Android App Bundle?",
    what: "У старого формата DEX-файлов (Dalvik Executable — формат, в который компилируется байт-код для Android) есть ограничение: один DEX-файл может ссылаться не более чем на 65 536 (64K) методов суммарно, включая методы всех подключённых библиотек.",
    key: "MultiDex — решение, позволяющее разбить код приложения на НЕСКОЛЬКО DEX-файлов вместо одного, обходя лимит — актуально для крупных приложений с большим количеством библиотек. Android App Bundle (.aab) — современный формат публикации в Google Play, который решает смежную проблему (общий размер APK): вместо одного APK 'на все случаи' Google Play сам собирает и доставляет пользователю МИНИМАЛЬНО НЕОБХОДИМЫЙ APK под конкретное устройство (нужная плотность экрана, архитектура процессора, язык), не включая лишние ресурсы для других конфигураций устройств.",
    example: "Сегодня MultiDex в большинстве современных проектов включается автоматически и прозрачно (начиная с minSdk 21 поддержка встроена в саму платформу), поэтому явно настраивать его вручную требуется редко — но важно понимать первопричину проблемы, если внезапно видишь ошибку сборки про превышение лимита методов.",
    code: null
  },
  {
    id: "a30", cat: "android", q: "Как устроен жизненный цикл виджета рабочего стола (Widget) и что такое RemoteViews?",
    what: "Виджет — мини-интерфейс приложения, отображаемый прямо на рабочем столе устройства, вне процесса самого приложения — технически виджет рисует не сама Activity, а система через посредника RemoteViews.",
    key: "RemoteViews — специальная 'сериализуемая' разметка, которую можно передать в ДРУГОЙ процесс (процесс Launcher'а, рисующего рабочий стол) для отрисовки — именно поэтому виджеты имеют ограниченный набор доступных View (не любой Custom View можно использовать в виджете, только заранее поддерживаемые системой) и ограниченную интерактивность (в основном клики через PendingIntent, а не произвольная логика). AppWidgetProvider (по сути специализированный BroadcastReceiver) управляет жизненным циклом виджета — периодически получает команды на обновление контента через onUpdate().",
    example: "Именно поэтому клики в виджете реализуются через PendingIntent (мы разбирали эту карточку) — сам виджет физически рисуется в чужом процессе, а твоё приложение не может напрямую обработать клик обычным onClickListener, только через заранее подготовленное отложенное намерение.",
    code: null
  },
  {
    id: "a31", cat: "android", q: "Что такое Notification Channel и зачем его ввели?",
    what: "Notification Channel (канал уведомлений, появился в Android 8.0) — категория уведомлений, для которой пользователь может НАСТРОИТЬ поведение (звук, вибрация, важность, отображение на экране блокировки) ОТДЕЛЬНО от остальных уведомлений того же приложения.",
    key: "До введения каналов пользователь мог только полностью включить или выключить ВСЕ уведомления приложения разом — не было возможности, например, отключить только маркетинговые push-уведомления, оставив включёнными важные уведомления о заказах. Каждое уведомление на Android 8+ ОБЯЗАНО принадлежать какому-то каналу — если не создать канал явно, система либо не покажет уведомление, либо будет ругаться логами (в зависимости от версии).",
    example: "Практическое следствие для архитектуры — приложение должно создавать нужные каналы ЗАРАНЕЕ (обычно в Application.onCreate()) с понятными пользователю названиями категорий ('Сообщения', 'Акции и скидки'), а не полагаться на одно уведомление 'обо всём'.",
    code: null
  },

  {
    id: "c6", cat: "coroutines", q: "launch vs async — в чём принципиальная разница?",
    what: "Оба — билдеры¹ (функции, запускающие новую корутину), но с разной целью: launch — 'запусти и забудь' (fire-and-forget), async — 'запусти и дождись результата'.",
    key: "launch возвращает Job — объект для управления жизненным циклом корутины (отмена, проверка состояния), но БЕЗ доступа к результату выполнения (потому что его как бы 'нет' — это побочный эффект, а не вычисление значения). async возвращает Deferred<T> (наследник Job) — 'обещание' результата, которое можно получить через await() — при этом await() ПРИОСТАНАВЛИВАЕТ вызывающую корутину до готовности результата, не блокируя реальный поток.",
    example: "Правило выбора: нужно просто выполнить действие (сохранить в БД, отправить аналитику) — launch. Нужно получить и использовать РЕЗУЛЬТАТ вычисления (загрузить данные и показать их) — async + await.",
    code: `viewModelScope.launch { saveToDatabase(item) } // fire-and-forget, результат не нужен

viewModelScope.launch {
    val result = async { loadDataFromNetwork() }.await() // ждём и получаем результат
    updateUi(result)
}`
  },
  {
    id: "c7", cat: "coroutines", q: "Как suspend-функции работают 'под капотом' — что такое Continuation и стейт-машина?",
    what: "На этапе компиляции каждая suspend-функция превращается компилятором в конечный автомат¹ (стейт-машину) — специальный класс, реализующий интерфейс Continuation, который умеет 'запоминать', на каком шаге функция остановилась, и продолжить именно с этого места.",
    key: "Каждая точка приостановки (вызов другой suspend-функции внутри) становится отдельным 'состоянием' (label¹) этой стейт-машины. Когда suspend-функция вызывает delay() или другую suspend-функцию, она НЕ блокирует поток — вместо этого она регистрирует Continuation (по сути колбэк 'продолжи с этого места, когда будешь готов') и возвращает управление вызывающему коду, освобождая реальный системный поток для другой работы, пока не наступит момент возобновления.",
    example: "Именно поэтому suspend-функции можно вызывать только из другой suspend-функции или из корутины — обычная функция не умеет 'принять' скрытый параметр Continuation, который компилятор незаметно добавляет к каждой suspend-функции.",
    code: null
  },
  {
    id: "c8", cat: "coroutines", q: "Как работает CoroutineExceptionHandler и когда он НЕ сработает?",
    what: "CoroutineExceptionHandler — элемент CoroutineContext, служащий 'последней линией обороны' для НЕОБРАБОТАННЫХ исключений, всплывших из корутины — обычно используется для логирования/аналитики, а не для восстановления после ошибки.",
    key: "Работает только на КОРНЕВОЙ корутине (launched напрямую из scope, а не вложенной) и только для builders типа launch — для async исключение сохраняется внутри Deferred и всплывёт только при вызове await(), CoroutineExceptionHandler в этом случае НЕ вызовется вообще (потому что concept предполагает, что вызывающий код сам обработает исключение через try/catch вокруг await()). Также если используется SupervisorJob, обработчик всё равно получает исключения от каждого упавшего дочернего элемента по отдельности, а не одно общее.",
    example: "Частая ошибка на собесе — думать, что CoroutineExceptionHandler 'ловит всё' как глобальный try-catch; на самом деле это скорее fallback-логирование для конкретных сценариев launch, а не универсальный механизм обработки ошибок.",
    code: `val handler = CoroutineExceptionHandler { _, exception ->
    Log.e("App", "Необработанное исключение", exception)
}

val scope = CoroutineScope(SupervisorJob() + handler)
scope.launch { throw RuntimeException("упало") } // handler сработает
scope.async { throw RuntimeException("упало") }  // handler НЕ сработает — исключение ждёт await()`
  },
  {
    id: "c9", cat: "coroutines", q: "viewModelScope + SupervisorJob — как это устроено внутри и зачем именно такая комбинация?",
    what: "viewModelScope — готовый CoroutineScope, автоматически привязанный к жизненному циклу конкретной ViewModel (Jetpack сам создаёт и отменяет его).",
    key: "Внутри viewModelScope используется именно SupervisorJob (а не обычный Job) — это осознанный архитектурный выбор: на одном экране обычно запущено НЕСКОЛЬКО независимых корутин (загрузка данных, отслеживание сетевого статуса, аналитика), и падение ОДНОЙ из них (например, сетевая ошибка при загрузке данных) не должно автоматически отменять остальные независимые задачи того же экрана. При уничтожении ViewModel (onCleared()) Jetpack сам вызывает viewModelScope.coroutineContext.cancel() — все запущенные в нём корутины отменяются автоматически, без ручного управления.",
    example: "Именно поэтому viewModelScope — пример хорошей инкапсуляции¹: разработчику не нужно вручную создавать Job, привязывать к жизненному циклу и не забывать отменять — вся эта забота скрыта за простым API.",
    code: `class MyViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch { repository.getData() } // SupervisorJob уже внутри, отмена — автоматическая
    }
}`
  },
  {
    id: "c10", cat: "coroutines", q: "Main, Main.immediate, IO, Default, Unconfined — детальное сравнение диспетчеров",
    what: "Диспетчер определяет, НА КАКОМ ПОТОКЕ (или пуле потоков) будет выполняться код корутины.",
    key: "Main — главный (UI) поток, единственный. Main.immediate — тот же главный поток, но с оптимизацией: если код УЖЕ выполняется на главном потоке, выполнение продолжится СРАЗУ, без постановки в очередь Handler'а (обычный Main всегда ставит задачу в очередь, даже если уже находится на нужном потоке). IO — пул потоков большого размера (обычно до 64), оптимизирован для операций ввода-вывода (сеть, диск, БД), где потоки большую часть времени ПРОСТАИВАЮТ в ожидании ответа, поэтому иметь много потоков не накладно. Default — пул потоков размером ПО КОЛИЧЕСТВУ ЯДЕР процессора, оптимизирован для CPU-интенсивных вычислений (парсинг, сортировка), где больше потоков, чем ядер, не даст выигрыша. Unconfined — не привязан к конкретному потоку: стартует на текущем потоке вызова, но ПОСЛЕ первой точки приостановки продолжает выполнение на потоке, который его возобновил — непредсказуемое поведение, используется практически только в тестах.",
    example: "Если выполнить тяжёлые вычисления на Dispatchers.IO вместо Default — они всё равно выполнятся, но неэффективно используют ресурсы: пул IO рассчитан на много ОЖИДАЮЩИХ потоков, а не на параллельные вычисления, конкурирующие за реальные ядра процессора.",
    code: null
  },
  {
    id: "c11", cat: "coroutines", q: "Из чего состоит CoroutineContext и можно ли его менять во время выполнения?",
    what: "CoroutineContext — набор из нескольких независимых 'элементов настройки' корутины, объединённых оператором + в один составной контекст.",
    key: "Основные элементы: Job (управление жизненным циклом и отменой), CoroutineDispatcher (на каком потоке выполняться), CoroutineName (имя для отладки в логах), CoroutineExceptionHandler (обработка необработанных исключений). Изменить контекст 'на лету' у уже запущенной корутины напрямую нельзя, но можно временно ЗАПУСТИТЬ участок кода с ДРУГИМ контекстом через withContext(newContext) { ... } — это создаёт новую корутину с изменённым контекстом, дожидается её завершения и возвращает результат, как будто это часть той же последовательной логики.",
    example: "withContext(Dispatchers.IO) { ... } внутри suspend-функции, вызванной из Main — самый частый практический паттерн: временно переключиться на фоновый поток именно для сетевого запроса, а после автоматически вернуться туда, откуда был вызов.",
    code: `val context = Job() + Dispatchers.IO + CoroutineName("Loader") + handler
val scope = CoroutineScope(context)

suspend fun loadData() = withContext(Dispatchers.IO) { // временная смена диспетчера
    api.fetchData() // выполнится на IO, после — управление вернётся на исходный диспетчер
}`
  },
  {
    id: "c12", cat: "coroutines", q: "Почему GlobalScope считается плохой практикой?",
    what: "GlobalScope — предопределённый CoroutineScope, который живёт РОВНО СТОЛЬКО, сколько живёт весь процесс приложения, полностью независимо от жизненного цикла любого конкретного экрана или компонента.",
    key: "Корутина, запущенная через GlobalScope.launch, НЕ будет автоматически отменена при уничтожении Activity/Fragment/ViewModel, где она была запущена — если внутри такой корутины есть ссылка на View или Context (например, обновление UI после сетевого запроса), это прямой путь к утечке памяти и попыткам обновить уже уничтоженный экран. Кроме того, GlobalScope нарушает саму идею structured concurrency¹ — корутина 'выпадает' из общей иерархии Job, и родительский компонент физически не может её отследить или отменить при необходимости.",
    example: "Правильная альтернатива почти всегда — использовать scope, привязанный к жизненному циклу компонента (viewModelScope, lifecycleScope), а не GlobalScope 'для надёжности, чтобы точно не прервалось'.",
    code: null
  },
  {
    id: "c13", cat: "coroutines", q: "Что такое CancellationException и почему её нельзя просто 'проглатывать'?",
    what: "CancellationException — специальное исключение, которое Kotlin Coroutines использует ВНУТРЕННЕ как штатный механизм отмены корутины — это НЕ ошибка в привычном смысле, а часть нормального жизненного цикла.",
    key: "Если внутри suspend-функции обернуть код в try-catch (Exception::class) без разбора конкретного типа, можно случайно ПОЙМАТЬ CancellationException вместе с реальными ошибками — если после этого не пробросить её дальше (rethrow), корутина 'думает', что отмена не удалась, и может продолжить выполнение, хотя должна была остановиться, что ломает всю систему structured concurrency.",
    example: "Правильный паттерн — либо явно ловить конкретные типы исключений (не общий Exception), либо в catch-блоке проверять и перебрасывать CancellationException дальше, прежде чем обрабатывать остальные ошибки.",
    code: `try {
    doWork()
} catch (e: CancellationException) {
    throw e // ОБЯЗАТЕЛЬНО пробросить дальше — это не ошибка, а сигнал отмены
} catch (e: Exception) {
    log(e) // а вот это уже реальная ошибка, которую можно спокойно обработать
}`
  },
  {
    id: "c14", cat: "coroutines", q: "Чем join() отличается от await()?",
    what: "Оба приостанавливают текущую корутину до завершения другой, но предназначены для разных билдеров и дают разный результат.",
    key: "join() — метод Job (то есть работает и для launch, и для async, так как Deferred — наследник Job), просто ЖДЁТ завершения корутины, не давая доступа к результату (для launch результата и нет). await() — метод именно Deferred (доступен только у async), ждёт завершения И ВОЗВРАЩАЕТ результат вычисления — если внутри была ошибка, await() перебросит это исключение в точке вызова.",
    example: "Если запущено несколько async-задач и нужно и дождаться всех, и получить результаты каждой — используй await() у каждой (или awaitAll() для списка Deferred), а не join(), который результат просто не даст.",
    code: `val job = launch { doWork() }
job.join() // просто ждём завершения, результата нет

val deferred = async { computeValue() }
val result = deferred.await() // ждём завершения И получаем результат`
  },
  {
    id: "c15", cat: "coroutines", q: "Что такое lifecycleScope и чем отличается от viewModelScope?",
    what: "lifecycleScope — готовый CoroutineScope, привязанный к жизненному циклу конкретного LifecycleOwner (обычно Activity или Fragment), а не ViewModel.",
    key: "Ключевое отличие от viewModelScope — время жизни: lifecycleScope отменяется при уничтожении САМОГО Activity/Fragment (то есть переживает только ОДИН экземпляр экрана, не переживает поворот экрана — при пересоздании Activity создаётся новый lifecycleScope). viewModelScope переживает смену конфигурации, потому что сама ViewModel переживает поворот экрана. Отсюда правило: бизнес-логику, связанную с данными экрана, стоит запускать во ViewModel (viewModelScope), а чисто UI-специфичные вещи, завязанные именно на текущий Fragment/Activity (например, анимация, привязанная к конкретному View) — через lifecycleScope.",
    example: "Есть более узкий вариант — lifecycleScope.launch { repeatOnLifecycle(Lifecycle.State.STARTED) { ... } } — гарантирует, что код выполняется ТОЛЬКО пока экран реально виден пользователю (между onStart и onStop), автоматически приостанавливаясь и возобновляясь.",
    code: `class MyFragment : Fragment() {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { updateUi(it) } // работает только пока экран виден
            }
        }
    }
}`
  },
  {
    id: "c16", cat: "coroutines", q: "Что такое suspendCancellableCoroutine и зачем он нужен?",
    what: "suspendCancellableCoroutine — низкоуровневая функция-'мост' между корутинами и старым callback-based API (колбэками) — позволяет обернуть любой асинхронный вызов с колбэком в обычную suspend-функцию.",
    key: "Внутри блока получаешь объект continuation, у которого нужно вызвать resume(value) при успехе или resumeWithException(error) при ошибке колбэка — именно это 'превращает' асинхронный колбэк в suspend-функцию, которую можно спокойно вызывать через await-подобный синтаксис. Отличие от обычного suspendCoroutine — добавлена поддержка ОТМЕНЫ: через invokeOnCancellation {} можно корректно освободить ресурсы (отменить реальный сетевой запрос), если внешняя корутина была отменена, пока ждала результат.",
    example: "Типичный кейс использования — обёртка старого Retrofit Call (с enqueue/Callback) в suspend-функцию, если по какой-то причине нельзя перейти на нативную поддержку suspend в самом Retrofit.",
    code: `suspend fun Call<String>.awaitResult(): String = suspendCancellableCoroutine { continuation ->
    continuation.invokeOnCancellation { this.cancel() } // отменяем реальный запрос при отмене корутины

    enqueue(object : Callback<String> {
        override fun onResponse(call: Call<String>, response: Response<String>) {
            continuation.resume(response.body() ?: "")
        }
        override fun onFailure(call: Call<String>, t: Throwable) {
            continuation.resumeWithException(t)
        }
    })
}`
  },

  // ---------------- ВЬЮ XML (доп., закрытие) ----------------
  {
    id: "vx5", cat: "viewxml", q: "Жизненный цикл Custom View: onMeasure, onLayout, onDraw — что делает каждый метод?",
    what: "Три метода, которые последовательно вызывает система при отрисовке любой View — переопределяются, когда встроенных View недостаточно для нужного визуального поведения.",
    key: "onMeasure(widthMeasureSpec, heightMeasureSpec) — View должна вычислить и сообщить системе СВОЙ РАЗМЕР через setMeasuredDimension(), учитывая ограничения от родителя (MeasureSpec — режимы EXACTLY/AT_MOST/UNSPECIFIED). onLayout(changed, left, top, right, bottom) — для ViewGroup: расставляет дочерние элементы по вычисленным координатам (у обычной View, без детей, обычно не переопределяется). onDraw(canvas) — реальная отрисовка содержимого через объекты Canvas (холст) и Paint (кисть/стиль) — сюда нельзя класть создание новых объектов (см. нашу карточку про GC и производительность onDraw).",
    example: "Порядок вызовов при каждом кадре: сначала родитель измеряет себя и детей (onMeasure сверху вниз рекурсивно), потом расставляет их (onLayout), и только потом всё отрисовывается (onDraw) — понимание этого порядка часто спрашивают на собесе через вопрос 'кто измеряется первым, родитель или ребёнок'.",
    code: null
  },
  {
    id: "vx6", cat: "viewxml", q: "Производительность лейаутов: чем FrameLayout легче LinearLayout с весами, а ConstraintLayout — гибче обоих?",
    what: "Разные типы контейнеров расходуют разное количество ресурсов на этапе измерения (onMeasure), особенно при глубокой вложенности.",
    key: "FrameLayout — самый лёгкий, обычно для одного элемента поверх другого (нет сложной логики позиционирования). LinearLayout с атрибутом layout_weight заставляет систему делать ДВА прохода измерения вместо одного (сначала измерить без учёта веса, потом пересчитать пропорции) — при глубокой вложенности нескольких LinearLayout с весами это может заметно замедлить отрисовку. ConstraintLayout решает проблему глубокой вложенности иначе — позволяет строить сложные интерфейсы 'плоско' (без вложенности контейнеров друг в друга), задавая связи между элементами через constraint'ы, и вычисляет позиции решением системы уравнений за один проход.",
    example: "Практическое правило: для простых экранов вложенность 2-3 уровней LinearLayout/RelativeLayout — не проблема; когда иерархия становится глубже, переход на плоский ConstraintLayout обычно ощутимо ускоряет отрисовку.",
    code: null
  },
  {
    id: "vx7", cat: "viewxml", q: "Spannable/ClickableSpan и PrecomputedText — для чего нужны эти механизмы работы с текстом?",
    what: "Spannable — способ применить РАЗНОЕ форматирование (цвет, кликабельность, подчёркивание) к РАЗНЫМ частям одной строки текста внутри одного TextView, без необходимости разбивать текст на несколько View. PrecomputedText — механизм заранее (на фоновом потоке) вычислить метрики layout текста (перенос строк, ширину), чтобы не делать эту тяжёлую работу синхронно в UI-потоке при первой отрисовке.",
    key: "ClickableSpan — конкретная реализация Span, добавляющая кликабельность к куску текста (например, гиперссылка внутри абзаца) с собственным обработчиком onClick именно для этого фрагмента. PrecomputedText особенно полезен для длинных текстов (большие абзацы, целые статьи) — без него вычисление раскладки текста происходит синхронно при первом onMeasure/onDraw, что может подвесить UI-поток на заметное время для очень длинного контента.",
    example: "Реализация эффекта 'спойлера' как в Telegram (текст скрыт за визуальным шумом до тапа) обычно строится именно на кастомном Span поверх ClickableSpan — сначала рисуется шум вместо текста, а по клику Span убирается и текст показывается.",
    code: null
  },
  {
    id: "vx8", cat: "viewxml", q: "ListView vs RecyclerView — почему RecyclerView практически везде заменил ListView?",
    what: "Оба показывают прокручиваемые списки данных, но RecyclerView — более гибкая и производительная эволюция ListView, появившаяся позже как часть Jetpack.",
    key: "ListView имеет встроенный, но негибкий механизм переиспользования View (convertView в getView()) — паттерн ViewHolder приходится реализовывать вручную поверх него, и легко забыть про оптимизацию. RecyclerView делает переиспользование ViewHolder ОБЯЗАТЕЛЬНОЙ частью архитектуры API (нельзя написать адаптер без ViewHolder в принципе), из коробки поддерживает горизонтальную прокрутку, сетки (GridLayoutManager), сложные анимации изменений и модульную настройку через LayoutManager — ListView всё это либо не умеет, либо требует существенных костылей.",
    example: "Сегодня ListView считается легаси-компонентом — новый код почти никогда не пишут на нём, только поддерживают старый существующий код, который ещё не мигрировали на RecyclerView.",
    code: null
  },

  // ---------------- FLOW (доп., закрытие) ----------------
  {
    id: "fl4", cat: "flow", q: "Холодный vs горячий Flow — базовое отличие простыми словами",
    what: "Cold (холодный) Flow — источник данных, который НЕ начинает работать, пока кто-то явно не подпишется (не вызовет collect) — при каждой новой подписке весь код внутри flow {} выполняется ЗАНОВО, с нуля. Hot (горячий) Flow — источник существует и 'живёт' независимо от того, есть ли подписчики прямо сейчас, просто транслирует изменения всем, кто в данный момент подписан.",
    key: "Обычный flow {} builder всегда холодный. StateFlow и SharedFlow — горячие по своей природе. Разница критична при нескольких подписчиках: у холодного Flow каждый подписчик получает СВОЙ независимый запуск источника (например, свой отдельный сетевой запрос), у горячего — все подписчики делят ОДИН общий поток данных.",
    example: "Если сетевой запрос обёрнут в обычный flow {} и на него подписались 3 разных экрана — выполнится 3 РЕАЛЬНЫХ отдельных сетевых запроса; чтобы разделить один результат на всех, холодный Flow нужно предварительно превратить в горячий через .stateIn()/.shareIn().",
    code: null
  },
  {
    id: "fl5", cat: "flow", q: "Что такое channelFlow и чем отличается от callbackFlow?",
    what: "Оба — билдеры для создания Flow из ИСТОЧНИКОВ, которые сами по себе не suspend-функции (обычно callback-based API), но channelFlow даёт больше гибкости.",
    key: "callbackFlow — специализированная версия именно под адаптацию callback-API: внутри доступен trySend() для отправки значений и awaitClose{} для очистки при отмене подписки. channelFlow — более общий инструмент, позволяющий эмитить значения ИЗ РАЗНЫХ КОРУТИН ОДНОВРЕМЕННО (например, если нужно параллельно опрашивать несколько источников и объединять результаты в один Flow) — callbackFlow технически является частным случаем поверх той же механики channelFlow, заточенным конкретно под колбэки.",
    example: "Если нужно просто адаптировать один существующий callback-listener в Flow — используй callbackFlow (он проще и точнее выражает намерение). Если нужно эмитить из нескольких параллельных корутин в один общий Flow — нужен именно channelFlow.",
    code: null
  },
  {
    id: "fl6", cat: "flow", q: "Обзор ключевых операторов Flow: map, filter, retry, debounce, distinctUntilChanged, flatMapLatest",
    what: "Набор промежуточных операторов, которые трансформируют Flow, не запуская его сбор (collect) — сами по себе ничего не эмитят, пока не появится терминальный оператор в конце цепочки.",
    key: "map/filter — базовая трансформация и фильтрация значений, как в обычных коллекциях, только применительно к асинхронному потоку. retry — при возникновении исключения повторяет попытку подписки на источник заданное число раз (полезно для нестабильных сетевых запросов). debounce(timeout) — эмитит значение только если после него не пришло новое значение в течение таймаута (классика для поиска по мере набора текста). distinctUntilChanged() — пропускает значение, если оно равно предыдущему эмитированному (экономит лишние обновления UI на повторяющихся данных). flatMapLatest — при появлении нового значения из исходного Flow отменяет ещё не завершившийся внутренний Flow от предыдущего значения и переключается на новый (Flow-аналог switchMap из RxJava).",
    example: "Классическая связка для поиска: searchQueryFlow.debounce(300).distinctUntilChanged().flatMapLatest { query -> searchApi.search(query) } — не долбит сеть на каждое нажатие клавиши, не повторяет одинаковые запросы подряд, и отменяет устаревший поиск при новом вводе.",
    code: null
  },
  {
    id: "fl7", cat: "flow", q: "Что делают stateIn и shareIn — как превратить холодный Flow в горячий?",
    what: "Оба превращают обычный (холодный) Flow в горячий, разделяемый между несколькими подписчиками, но с разными гарантиями по стартовому значению.",
    key: "stateIn() — превращает Flow в StateFlow: требует ОБЯЗАТЕЛЬНОЕ начальное значение (initialValue) и всегда хранит последнее эмитированное значение, доступное новым подписчикам немедленно. shareIn() — превращает Flow в SharedFlow: более гибкая настройка (replay, буфер), не требует стартового значения по умолчанию. Оба принимают SharingStarted — стратегию, КОГДА реально запускать исходный холодный Flow относительно подписчиков (Eagerly — сразу; Lazily — при первой подписке; WhileSubscribed — только пока есть хотя бы один активный подписчик, с задержкой остановки).",
    example: "WhileSubscribed(5000) — частый практический выбор: источник данных (например, сетевой поток) остаётся активным ещё 5 секунд после отписки последнего подписчика, чтобы пережить короткий разрыв связи при повороте экрана без полного перезапуска источника.",
    code: `val uiState: StateFlow<ScreenState> = repository.observeData()
    .map { it.toUiState() }
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = ScreenState.Loading
    )`
  },

  // ---------------- КОНКУРЕНТНОСТЬ (доп., закрытие) ----------------
  {
    id: "conc4", cat: "concurrency", q: "Mutex vs synchronized — почему для корутин нужен именно Mutex?",
    what: "Оба защищают доступ к общему ресурсу от одновременного изменения несколькими 'исполнителями', но synchronized блокирует ПОТОК, а Mutex — блокирует именно КОРУТИНУ, не трогая реальный системный поток.",
    key: "synchronized внутри suspend-функции — плохая идея: он БЛОКИРУЕТ поток целиком, пока не освободится, и внутри synchronized-блока НЕЛЬЗЯ вызывать другие suspend-функции (это может привести к взаимной блокировке или просто ломает саму идею неблокирующей асинхронности корутин). Mutex.withLock { ... } — корутино-совместимая альтернатива: если ресурс занят, корутина просто ПРИОСТАНАВЛИВАЕТСЯ (suspend), освобождая реальный поток для другой работы, вместо того чтобы держать поток заблокированным вхолостую.",
    example: "Правило: обычный код (не suspend) — synchronized/Lock. Код внутри suspend-функций, где нужна защита общего состояния — обязательно Mutex, а не synchronized.",
    code: `class SafeCounter {
    private val mutex = Mutex()
    private var count = 0

    suspend fun increment() = mutex.withLock { // suspend-совместимая блокировка
        count++
    }
}`
  },
  {
    id: "conc5", cat: "concurrency", q: "Как устроен Thread Pool и почему он эффективнее ручного создания потоков?",
    what: "Thread Pool — набор заранее созданных и переиспользуемых потоков, между которыми распределяются входящие задачи, вместо создания нового системного потока под каждую отдельную задачу.",
    key: "Создание реального потока ОС — дорогая операция (выделение памяти под стек потока, системные вызовы) — если создавать поток на каждую мелкую задачу, накладные расходы могут превысить пользу от параллелизма. Пул решает это, переиспользуя уже существующие потоки: задача становится в очередь, свободный поток её забирает, выполняет, и возвращается ждать следующую задачу.",
    example: "Мы уже разбирали конкретную реализацию — ThreadPoolExecutor в Java — этот же принцип лежит в основе Dispatchers.IO/Default в Kotlin Coroutines.",
    code: null
  },
  {
    id: "conc6", cat: "concurrency", q: "Atomic-типы (AtomicInteger, AtomicReference) — как они добиваются атомарности без блокировок?",
    what: "Atomic-типы дают гарантированно атомарные (неделимые) операции чтения-изменения-записи над одним значением, не используя synchronized/Lock вообще.",
    key: "Механизм основан на аппаратной инструкции процессора Compare-And-Swap (CAS) — операция 'сравни текущее значение с ожидаемым, и если совпадает, замени на новое' выполняется атомарно на уровне самого процессора, без участия ОС. Если между чтением и попыткой записи другой поток успел изменить значение — CAS просто не сработает, и Atomic-тип автоматически повторит попытку (retry-цикл) с новым актуальным значением, пока не получится.",
    example: "Именно поэтому Atomic-типы быстрее synchronized для простых операций вроде счётчика — нет реальной блокировки потока и ожидания освобождения монитора, только быстрый цикл 'попробовать снова' на уровне процессора.",
    code: `val counter = AtomicInteger(0)
counter.incrementAndGet() // атомарно, без блокировки — под капотом CAS-цикл`
  },
  {
    id: "conc7", cat: "concurrency", q: "Что такое Semaphore и чем отличается от Mutex?",
    what: "Semaphore — примитив синхронизации, ограничивающий количество потоков/корутин, одновременно имеющих доступ к ресурсу, ЧИСЛОМ (не обязательно единицей).",
    key: "Mutex — по сути частный случай Semaphore с ограничением РОВНО в 1 (только один исполнитель одновременно). Semaphore(n) позволяет ровно n одновременных 'пропусков' — например, ограничить количество ОДНОВРЕМЕННЫХ сетевых запросов пятью, даже если реально запущено 100 корутин, желающих сходить в сеть.",
    example: "Практический кейс — ограничение параллельных загрузок изображений: Semaphore(4) гарантирует, что одновременно скачивается не больше 4 картинок, даже если экран запрашивает загрузку сразу 50 элементов списка.",
    code: `val semaphore = Semaphore(4) // не больше 4 одновременных операций

suspend fun loadImage(url: String): Bitmap = semaphore.withPermit {
    downloadAndDecode(url)
}`
  },

  // ---------------- DAGGER (доп., закрытие) ----------------
  {
    id: "d6", cat: "di", q: "Что такое Scope в Dagger и как @Singleton связан со временем жизни объекта?",
    what: "Scope-аннотация (@Singleton, @ActivityScoped и другие) говорит Dagger, что объект должен быть создан ОДИН РАЗ в рамках времени жизни определённого компонента и переиспользоваться при повторных запросах, а не создаваться заново на каждый инжект.",
    key: "Без scope Dagger создаёт НОВЫЙ экземпляр объекта КАЖДЫЙ раз, когда его инжектируют (unscoped binding) — это нормально для лёгких stateless-объектов, но плохо для тяжёлых/stateful (сетевой клиент, база данных), которые логически должны быть одним общим экземпляром. @Singleton привязывает время жизни объекта к времени жизни SingletonComponent (обычно = времени жизни всего приложения) — объект создаётся один раз при первом запросе и живёт до полного закрытия процесса.",
    example: "Частая ошибка — навесить @Singleton на объект, который на самом деле должен жить только в рамках одного экрана (например, хранящий состояние конкретной сессии редактирования) — это приводит к утечке состояния между разными использованиями экрана.",
    code: `@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton // один общий экземпляр на всё приложение
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder().build()
}`
  },
  {
    id: "d7", cat: "di", q: "Subcomponent в Dagger — как устроен и почему может замедлять сборку проекта?",
    what: "Subcomponent — вложенный DI-граф, который НАСЛЕДУЕТ все зависимости родительского компонента и добавляет свои собственные, обычно с более узким временем жизни (например, привязанным к конкретному экрану, а не ко всему приложению).",
    key: "Проблема с производительностью сборки: при ЛЮБОМ изменении в родительском компоненте (или его зависимостях) Dagger вынужден ПЕРЕГЕНЕРИРОВАТЬ весь граф subcomponent'а заново — при глубокой иерархии subcomponent'ов (subcomponent внутри subcomponent) это может значительно замедлять инкрементальную сборку проекта, особенно в крупных многомодульных приложениях.",
    example: "Современная альтернатива, решающая именно эту проблему — Component Dependencies (явные зависимости между независимыми компонентами верхнего уровня вместо вложенности) — Dagger не обязан пересобирать граф родителя при изменении зависимого компонента.",
    code: null
  },
  {
    id: "d8", cat: "di", q: "API vs Impl модули в многомодульном DI — зачем разделять интерфейс и реализацию по разным Gradle-модулям?",
    what: "API-модуль содержит только ПУБЛИЧНЫЙ КОНТРАКТ (интерфейсы, модели данных, необходимые для использования фичи снаружи) — БЕЗ конкретной реализации. Impl-модуль содержит РЕАЛЬНУЮ реализацию этого контракта и зависит от API-модуля.",
    key: "Другие фичи-модули зависят ТОЛЬКО от API-модуля, никогда напрямую от Impl — это даёт два практических преимущества: 1) ускорение параллельной сборки Gradle (изменение внутри Impl не требует пересборки модулей, зависящих только от API, если публичный контракт не поменялся); 2) реальное соблюдение Dependency Inversion (D из SOLID) на уровне модулей, а не только классов.",
    example: "Именно так устроена анатомия фича-модульной архитектуры, которую мы разбирали в System Design — Feature API не тянет за собой ни один конкретный DI-фреймворк или платформенную зависимость.",
    code: null
  },

  // ---------------- HILT (доп., закрытие) ----------------
  {
    id: "hilt2", cat: "hilt", q: "Какие готовые компоненты предоставляет Hilt и как они связаны друг с другом иерархически?",
    what: "Hilt заранее генерирует набор стандартных компонентов, привязанных к жизненному циклу конкретных Android-классов, вместо того чтобы разработчик писал их вручную, как в чистом Dagger.",
    key: "Иерархия (от самого долгоживущего к самому короткоживущему): SingletonComponent (время жизни приложения) → ActivityRetainedComponent (переживает смену конфигурации, как ViewModel) → ViewModelComponent / ActivityComponent → FragmentComponent → ViewComponent. Каждый дочерний компонент автоматически наследует все зависимости родительского.",
    example: "Если нужно ограничить время жизни объекта конкретным экраном (пересоздаётся при каждом новом открытии Activity, но переживает поворот) — используется @ActivityRetainedScoped, привязанный именно к ActivityRetainedComponent.",
    code: null
  },
  {
    id: "hilt3", cat: "hilt", q: "Почему Hilt может плохо масштабироваться на очень крупных проектах?",
    what: "Удобство Hilt (автоматическая генерация компонентов под каждый Android-класс) имеет цену — на очень крупных многомодульных проектах (100+ модулей) это может стать узким местом сборки.",
    key: "Hilt генерирует ОГРОМНЫЕ сабкомпоненты, объединяющие зависимости из ВСЕХ подключённых модулей приложения в один связанный граф — на проектах с большим количеством фича-модулей сгенерированный код одного сабкомпонента может достигать десятков тысяч строк, и любое изменение в ЛЮБОМ модуле требует перегенерации этого гигантского файла.",
    example: "Именно поэтому некоторые крупные компании сознательно остаются на чистом Dagger с явными Component Dependencies вместо Hilt — жертвуя удобством ради контроля над структурой графа и скоростью сборки.",
    code: null
  },

  // ---------------- ПАТТЕРНЫ (доп., закрытие) ----------------
  {
    id: "pat4", cat: "patterns", q: "Обзор структурных паттернов: Adapter, Decorator, Proxy, Facade — в чём разница между ними?",
    what: "Все четыре — структурные паттерны (описывают, как классы и объекты компонуются в более крупные структуры), но решают разные задачи совместимости и расширения поведения.",
    key: "Adapter — превращает интерфейс ОДНОГО класса в интерфейс, который ожидает клиент, НЕ меняя поведение. Decorator — динамически ДОБАВЛЯЕТ новое поведение объекту, оборачивая его в другой объект с тем же интерфейсом. Proxy — контролирует ДОСТУП к реальному объекту (ленивая инициализация, кэширование, проверка прав), сохраняя точно такой же интерфейс, как у оригинала. Facade — упрощает работу со СЛОЖНОЙ подсистемой, предоставляя единый удобный интерфейс поверх множества внутренних классов.",
    example: "WorkManager — реальный пример Facade из Android SDK: он прячет за собой выбор между JobScheduler/AlarmManager/BroadcastReceiver в зависимости от версии Android, предоставляя единый простой API.",
    code: null
  },
  {
    id: "pat5", cat: "patterns", q: "Обзор поведенческих паттернов: Observer, Strategy, Command, State — где встречаются в Android?",
    what: "Поведенческие паттерны описывают, КАК объекты взаимодействуют и распределяют ответственность между собой в рантайме.",
    key: "Observer — объект-наблюдатель подписывается на изменения другого объекта и реагирует автоматически (LiveData, StateFlow — прямая реализация этого паттерна). Strategy — семейство взаимозаменяемых алгоритмов, инкапсулированных за общим интерфейсом, выбираемых в рантайме (разные Comparator для одного списка). Command — инкапсулирует запрос как объект, позволяя откладывать его выполнение (PendingIntent — по сути Command-объект). State — поведение объекта меняется в зависимости от его внутреннего состояния (прямая параллель с sealed class для UI State в MVI).",
    example: "Понимание того, что LiveData/StateFlow — это применение классического паттерна Observer, а не 'магия Jetpack', помогает объяснять современные Android-инструменты через фундаментальные принципы ООП.",
    code: null
  },

  // ---------------- АРХИТЕКТУРНЫЕ ПАТТЕРНЫ (доп., закрытие) ----------------
  {
    id: "ar6", cat: "arch", q: "Многомодульность: какие конкретно плюсы и минусы стоит называть на собесе?",
    what: "Разделение приложения на независимые Gradle-модули вместо одного 'монолитного' модуля — архитектурное решение с реальными компромиссами, а не универсально 'правильный' подход.",
    key: "Плюсы: параллельная сборка модулей (ускоряет CI), возможность нескольким командам работать над разными фичами без конфликтов, явное разделение ответственности через границы модулей (Gradle физически не даст обратиться к internal-классу другого модуля), переиспользуемость. Минусы: возросшая сложность структуры проекта для новичков, риск избыточного дробления, при неаккуратном дизайне — рост времени сборки вместо ожидаемого ускорения.",
    example: "Частый вопрос 'на засыпку' — когда модулей становится СЛИШКОМ МНОГО: если добавление нового модуля создаёт больше накладных расходов на поддержку, чем реальной пользы от изоляции — это сигнал остановиться.",
    code: null
  },
  {
    id: "ar7", cat: "arch", q: "MVI: Store, Reducer, Middleware — что делает каждая сущность?",
    what: "Три ключевых компонента, из которых строится классическая реализация MVI (например, MVIKotlin) поверх единого источника истины (State).",
    key: "Store — центральный держатель состояния экрана, принимает Intent (намерения пользователя) и хранит единственный актуальный State. Reducer — ЧИСТАЯ функция (без побочных эффектов), которая на основе текущего State и полученного Intent вычисляет НОВЫЙ State. Middleware — обрабатывает побочные эффекты (сетевые запросы, работа с БД), перехватывает Intent, выполняет асинхронную работу, и в итоге сам инициирует новый Intent с результатом, который уже обработает Reducer.",
    example: "Разделение на Reducer (чистая логика перехода состояний) и Middleware (побочные эффекты) — прямое применение Single Responsibility: тестировать Reducer можно чистыми юнит-тестами без моков сети/БД.",
    code: null
  },

  // ---------------- ЧИСТЫЙ КОД (доп., закрытие) ----------------
  {
    id: "clean4", cat: "cleancode", q: "Что такое принципы GRASP и чем они дополняют SOLID?",
    what: "GRASP (General Responsibility Assignment Software Patterns) — набор принципов о том, КАКОМУ КОНКРЕТНО классу назначить ту или иную ответственность в системе — более практический и приземлённый, чем более абстрактный SOLID.",
    key: "Ключевые принципы: Information Expert — назначай ответственность тому классу, у которого УЖЕ ЕСТЬ вся необходимая информация для её выполнения. Creator — класс A должен создавать экземпляры класса B, если A содержит/агрегирует B или использует B. Low Coupling / High Cohesion — минимизировать зависимости между классами и держать внутри класса только логически связанные обязанности.",
    example: "Information Expert — практический пример: логика подсчёта общей суммы заказа должна жить в классе Order (у него есть список товаров и цен), а не в отдельном OrderCalculatorService.",
    code: null
  },
  {
    id: "clean5", cat: "cleancode", q: "Обзор антипаттернов: God Object, Spaghetti Code, Copy-Paste, Magic Numbers, Golden Hammer",
    what: "Антипаттерны — распространённые способы 'решить' задачу, которые кажутся рабочими в моменте, но систематически создают проблемы в поддержке кода в будущем.",
    key: "God Object — один класс берёт на себя слишком много ответственности. Spaghetti Code — запутанный код с множеством пересекающихся зависимостей. Copy-Paste программирование — копирование кода вместо выделения абстракции (нарушение DRY). Magic Numbers — использование 'голых' констант без объяснения смысла. Golden Hammer — использование одного и того же излюбленного инструмента для ВСЕХ задач без учёта applicable к ситуации.",
    example: "Magic Numbers — самый простой антипаттерн для быстрого улучшения кода на код-ревью: замена голого числа на именованную константу почти всегда мгновенно повышает читаемость.",
    code: null
  },
  {
    id: "clean6", cat: "cleancode", q: "Композиция vs наследование — почему 'предпочитай композицию наследованию' считается хорошим советом?",
    what: "Оба — способы переиспользовать код между классами, но с разной степенью жёсткости связи.",
    key: "Наследование создаёт ЖЁСТКУЮ статическую связь 'is-a', определённую на этапе компиляции — изменение родителя может непредсказуемо повлиять на ВСЕХ наследников (проблема хрупкого базового класса). Композиция создаёт ГИБКУЮ связь 'has-a' (класс Б содержит объект класса А и делегирует ему работу) — поведение можно менять в рантайме, подставляя разные реализации.",
    example: "Практический пример из Kotlin — делегирование интерфейса через by, которое мы разбирали в делегированных свойствах — это ровно композиция вместо наследования: поведение подставляется снаружи.",
    code: null
  },

  // ---------------- АЛГОРИТМЫ (доп., закрытие) ----------------
  {
    id: "al3", cat: "algo", q: "Two Sum за O(n) — классическая задача через HashMap",
    what: "Задача: дан массив чисел и целевая сумма, нужно найти ИНДЕКСЫ двух чисел, которые в сумме дают целевое значение.",
    key: "Наивное решение — перебор всех пар (два вложенных цикла), сложность O(n²). Оптимальное решение — один проход по массиву с HashMap: для каждого числа вычисляем нужное 'дополнение' до цели, и проверяем, встречалось ли уже такое дополнение раньше — если да, ответ найден за O(1), если нет — записываем текущее число в мапу и идём дальше.",
    example: "Это классический пример компромисса time-memory tradeoff — тратим O(n) памяти, чтобы выиграть в скорости по сравнению с O(n²) наивным решением.",
    code: `fun twoSum(nums: IntArray, target: Int): IntArray {
    val seen = HashMap<Int, Int>() // значение -> индекс
    nums.forEachIndexed { i, n ->
        val need = target - n
        seen[need]?.let { return intArrayOf(it, i) }
        seen[n] = i
    }
    return intArrayOf()
}`
  },
  {
    id: "al4", cat: "algo", q: "Min Cost Climbing Stairs — классический пример динамического программирования",
    what: "Задача: дана лестница, где у каждой ступеньки есть 'стоимость' подъёма, можно шагать на 1 или 2 ступеньки за раз, нужно найти МИНИМАЛЬНУЮ суммарную стоимость преодоления всей лестницы.",
    key: "Наивное решение — полный перебор всех путей — экспоненциальная сложность, потому что одни и те же подзадачи пересчитываются много раз. Динамическое программирование решает это, запоминая уже вычисленный результат для каждой ступеньки: минимальная стоимость дойти до ступеньки i равна cost[i] + min(результат для i-1, результат для i-2).",
    example: "Ключевая идея — переход от 'наивной рекурсии с пересчётом одного и того же' к 'запоминанию уже посчитанного' — это и есть суть DP, независимо от конкретной задачи.",
    code: `fun minCostClimbingStairs(cost: IntArray): Int {
    var prev2 = 0
    var prev1 = 0
    for (i in 2..cost.size) {
        val current = minOf(prev1 + cost[i - 1], prev2 + cost[i - 2])
        prev2 = prev1
        prev1 = current
    }
    return prev1 // O(n) по времени, O(1) по памяти
}`
  },
  {
    id: "al5", cat: "algo", q: "Алгоритм Дейкстры — как найти кратчайший путь простыми словами",
    what: "Алгоритм Дейкстры находит кратчайший путь от одной вершины графа до всех остальных (или до конкретной целевой), при условии что веса рёбер НЕОТРИЦАТЕЛЬНЫ.",
    key: "Идея: на каждом шаге выбираем ЕЩЁ НЕ ПОСЕЩЁННУЮ вершину с наименьшей известной дистанцией от старта, 'фиксируем' эту дистанцию как окончательную, и обновляем дистанции всех её соседей, если путь через эту вершину короче. Обычно реализуется через приоритетную очередь (min-heap), чтобы эффективно выбирать вершину с минимальной дистанцией на каждом шаге.",
    example: "Практическая аналогия — построение маршрута в навигационном приложении, хотя на практике для реальных карт используют более сложные оптимизации поверх той же базовой идеи (A*, учёт пробок).",
    code: null
  },

  // ---------------- ROOM + SQL (доп., закрытие) ----------------
  {
    id: "room3", cat: "room", q: "Базовые компоненты Room: @Entity, @Dao, @Database — как они связаны?",
    what: "Room состоит из трёх ключевых частей, которые вместе образуют типобезопасную обёртку над SQLite.",
    key: "@Entity — аннотация на data-классе, описывающая структуру ОДНОЙ ТАБЛИЦЫ (поля класса становятся колонками). @Dao — интерфейс с методами-запросами (@Query, @Insert, @Update, @Delete) — Room сам генерирует реализацию на этапе компиляции, проверяя корректность SQL ЕЩЁ ДО запуска приложения. @Database — абстрактный класс, объединяющий все Entity и предоставляющий доступ к DAO через абстрактные методы.",
    example: "Именно проверка SQL-запросов на этапе компиляции — главное практическое преимущество Room перед голым SQLite: опечатка в имени колонки будет поймана компилятором, а не крашем в рантайме.",
    code: `@Entity(tableName = "users")
data class UserEntity(@PrimaryKey val id: Long, val name: String)

@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getUser(id: Long): UserEntity?
}

@Database(entities = [UserEntity::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}`
  },
  {
    id: "room4", cat: "room", q: "Как реализовать связь many-to-many (многие ко многим) в Room?",
    what: "В отличие от связи один-ко-многим, связь многие-ко-многим требует ОТДЕЛЬНОЙ промежуточной таблицы (junction table), потому что у каждой записи с обеих сторон может быть несколько связей одновременно.",
    key: "Промежуточная таблица хранит ТОЛЬКО пары внешних ключей — по сути это просто 'таблица связей'. В коде Room это описывается через отдельный @Entity для junction-таблицы и @Relation с @Junction.",
    example: "Классический пример — студенты и курсы: один студент учится на нескольких курсах, один курс содержит много студентов — прямая связь через простой внешний ключ невозможна, нужна промежуточная таблица.",
    code: `@Entity(primaryKeys = ["studentId", "courseId"])
data class StudentCourseCrossRef(val studentId: Long, val courseId: Long)

data class StudentWithCourses(
    @Embedded val student: Student,
    @Relation(
        parentColumn = "id", entityColumn = "id",
        associateBy = Junction(StudentCourseCrossRef::class, parentColumn = "studentId", entityColumn = "courseId")
    )
    val courses: List<Course>
)`
  },

  // ---------------- RETROFIT + REST API (доп., закрытие) ----------------
  {
    id: "retro3", cat: "retrofit", q: "Retrofit vs Ktor/Ktorfit — когда стоит рассматривать альтернативу Retrofit?",
    what: "Retrofit — многолетний стандарт для сетевых запросов на чистом Android. Ktor Client — сетевая библиотека от JetBrains, спроектированная как МУЛЬТИПЛАТФОРМЕННАЯ. Ktorfit — надстройка над Ktor с Retrofit-подобным синтаксисом через аннотации.",
    key: "Если проект чисто Android — Retrofit остаётся зрелым и стабильным выбором. Если проект использует или планирует Kotlin Multiplatform (общий сетевой слой между Android и iOS) — Ktor/Ktorfit становится логичным выбором, потому что Retrofit жёстко привязан к JVM и не работает на iOS-таргете KMP.",
    example: "Мы уже разбирали эту тему в контексте мок-собеса — там ментор советовал переходить на Ktorfit именно потому, что в проекте планировался переход на Kotlin Multiplatform.",
    code: null
  },

  // ---------------- GIT (доп., закрытие) ----------------
  {
    id: "git3", cat: "git", q: "Что такое cherry-pick и когда он реально нужен?",
    what: "git cherry-pick позволяет взять ОДИН КОНКРЕТНЫЙ коммит из ЛЮБОЙ другой ветки и применить именно его поверх текущей ветки, не сливая всю ветку целиком.",
    key: "Отличие от merge/rebase — те работают с ДИАПАЗОНОМ коммитов, а cherry-pick берёт РОВНО ОДИН выбранный коммит по его хэшу, полностью игнорируя остальную историю той ветки-источника.",
    example: "Практический кейс — hotfix сделан в develop, но релизная ветка ещё не готова получить ВСЕ изменения develop целиком — можно cherry-pick именно тот коммит с фиксом прямо в релиз.",
    code: `git log develop --oneline # найти хэш нужного коммита
git checkout release
git cherry-pick <commit-hash> # применить именно этот один коммит поверх release`
  },
  {
    id: "git4", cat: "git", q: "Как разрешать конфликты, если твоя ветка сильно отстала от develop (например, на 10+ коммитов)?",
    what: "Чем дольше живёт feature-ветка без синхронизации с основной веткой разработки, тем больше накапливается расхождений и тем сложнее итоговое слияние.",
    key: "Практический подход: чаще подтягивать изменения из develop МЕЛКИМИ порциями (rebase раз в день-два); при реальном большом расхождении — rebase (не merge) поверх свежего develop, разрешая конфликты коммит за коммитом; при неуверенности — обязательно синхронизироваться с автором конфликтующих изменений.",
    example: "Именно поэтому в командах с активной разработкой поощряют короткоживущие feature-ветки — чем дольше ветка не синхронизирована, тем дороже становится финальное слияние.",
    code: null
  },

  // ---------------- TESTING (доп., закрытие) ----------------
  {
    id: "t5", cat: "testing", q: "Espresso vs Robolectric vs UI Automator — в чём разница между этими Android-инструментами тестирования?",
    what: "Три разных инструмента для UI-тестирования Android, отличающиеся тем, ГДЕ реально выполняются тесты и КАКОЙ уровень доступа к системе дают.",
    key: "Espresso — тесты на реальном устройстве/эмуляторе, проверяют ТВОЁ приложение, автоматически синхронизируются с UI-потоком. Robolectric — тесты на обычной JVM, БЕЗ реального эмулятора, симулируя Android SDK — заметно быстрее Espresso, но не 100% гарантия совпадения с реальным устройством. UI Automator — тесты на реальном устройстве, но могут взаимодействовать с ЛЮБЫМ приложением на экране, включая системные.",
    example: "Практическое правило: быстрые UI-проверки без устройства в CI — Robolectric. Полноценные end-to-end тесты твоего приложения — Espresso. Межприложенческие сценарии — UI Automator.",
    code: null
  },
  {
    id: "t6", cat: "testing", q: "Unit-тесты vs инструментальные тесты (Instrumentation tests) — в чём принципиальная разница?",
    what: "Unit-тесты проверяют изолированную логику БЕЗ зависимости от Android SDK, выполняются на обычной JVM за секунды. Инструментальные тесты требуют реального устройства/эмулятора, потому что проверяют то, что реально зависит от Android Framework.",
    key: "Практическое следствие для архитектуры — чем чище разделены слои (Clean Architecture), тем БОЛЬШЕ логики можно покрыть быстрыми unit-тестами (Domain-слой, ViewModel с моками), и тем МЕНЬШЕ реально нужно медленных инструментальных тестов.",
    example: "Хорошая пирамида тестирования — много быстрых unit-тестов у основания, меньше интеграционных, и совсем немного дорогих end-to-end инструментальных тестов на самом верху.",
    code: null
  },
  {
    id: "t7", cat: "testing", q: "Что такое code coverage и почему высокий процент покрытия не гарантирует качество тестов?",
    what: "Code coverage — метрика, показывающая, какой ПРОЦЕНТ строк/веток кода реально ВЫПОЛНЯЕТСЯ хотя бы одним тестом при прогоне тестового набора.",
    key: "Критически важный нюанс: coverage измеряет только факт ВЫПОЛНЕНИЯ строки, а не то, есть ли в тесте РЕАЛЬНАЯ ПРОВЕРКА (assertion) результата — можно написать тест без осмысленной проверки, и coverage покажет 100%. Высокий процент покрытия — необходимое, но НЕ достаточное условие качественного тестирования.",
    example: "Частая практика — устанавливать МИНИМАЛЬНЫЙ порог покрытия для нового кода (40-70%) как формальный барьер, но полагаться на код-ревью тестов для реальной оценки качества.",
    code: null
  },

  // ---------------- SYSTEM DESIGN (доп., закрытие) ----------------
  {
    id: "sd7", cat: "sysdesign", q: "Какие варианты локального хранения данных обсуждать в System Design интервью?",
    what: "На мобильном устройстве есть несколько принципиально разных вариантов хранения данных, каждый со своими компромиссами.",
    key: "Key-Value (SharedPreferences/DataStore) — просто, но не для больших объёмов, нет схемы/миграций/запросов. Database/ORM (Room) — для больших объёмов структурированных данных со сложными запросами. Файловое хранилище — для бинарных данных (изображения, кэш медиа). Secure Storage (Keystore/EncryptedSharedPreferences) — для чувствительных данных (токены, ключи).",
    example: "Хороший ответ на System Design интервью — явно привязать выбор к требованиям: 'для оффлайн-кэша ленты используем Room, а токен авторизации — в EncryptedSharedPreferences'.",
    code: null
  },
  {
    id: "sd8", cat: "sysdesign", q: "Что такое Resumable Upload и когда он оправдан?",
    what: "Resumable (возобновляемая, фрагментированная) загрузка разбивает ОДИН большой запрос загрузки на НЕСКОЛЬКО этапов вместо одной непрерывной передачи целиком.",
    key: "Главное преимущество — при обрыве соединения НЕ нужно начинать всё сначала: клиент помнит последний успешно отправленный chunk. Цена — дополнительная сложность, поэтому оправдан для БОЛЬШИХ файлов в нестабильной сети; для мелких файлов накладные расходы фрагментации не окупаются.",
    example: "Реальные примеры — загрузка видео в YouTube, фото в Google Photos: оба используют именно фрагментированную возобновляемую загрузку для больших медиафайлов.",
    code: null
  },
  {
    id: "sd9", cat: "sysdesign", q: "Что такое prefetching (предзагрузка) и какой у неё главный риск?",
    what: "Prefetching — загрузка данных ЗАРАНЕЕ, до того как пользователь их реально запросит, чтобы скрыть задержку сети в момент, когда данные понадобятся.",
    key: "Главный риск — предзагруженные данные МОГУТ НЕ ПОНАДОБИТЬСЯ вообще, а трафик и батарея уже потрачены впустую. Хорошая реализация учитывает контекст (предзагружать только при Wi-Fi и достаточном заряде, а не всегда).",
    example: "Практический пример — предзагрузка следующей 'страницы' списка, когда пользователь долистал до 80% текущей загруженной порции, чтобы прокрутка выглядела бесшовной.",
    code: null
  },

  // ---------------- RXJAVA (доп., закрытие) ----------------
  {
    id: "rx6", cat: "rxjava", q: "Schedulers.io() vs Schedulers.computation() — в чём разница?",
    what: "Оба — планировщики потоков в RxJava, определяющие пул для выполнения — прямой аналог Dispatchers.IO/Default в мире корутин.",
    key: "Schedulers.io() — большой динамический пул для операций ввода-вывода (сеть, диск), где потоки простаивают в ожидании. Schedulers.computation() — пул по количеству ядер процессора, для CPU-интенсивных вычислений.",
    example: "Та же логика, что мы разбирали для Dispatchers.IO/Default — RxJava и корутины решают одну проблему почти идентичным способом, просто разными API.",
    code: null
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
