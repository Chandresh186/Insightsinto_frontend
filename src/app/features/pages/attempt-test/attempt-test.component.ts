import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TestSeriesService } from '../../../core/services/test-series.service';
import { catchError, finalize, forkJoin, interval, of, Subscription, take, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Test } from '../../../core/models/interface/test.interface';
import { ToastrService } from 'ngx-toastr';
import Quill from 'quill';
import { ngbootstrapModule } from '../../../shared/modules/ng-bootstrap.modules';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-attempt-test',
  standalone: true,
  imports: [CommonModule, FormsModule, ngbootstrapModule],
  templateUrl: './attempt-test.component.html',
  styleUrl: './attempt-test.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AttemptTestComponent implements OnInit {
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public currentQuestion: any
  public currentQuestioNumber :any = []
  public selectedAnswer: string | null = null;
  public answeredArray: any = [];
  public reviewArray: any = [];
  public testDetails!: Test;
  public quillEditor: Quill[] | undefined;


  questions:any = [
    // {
    //   "id": "f8c0b3d1-530d-4e9e-96f2-dc79f7a3d3bf",
    //   "question": "ભારતનો રાષ્ટ્રગાન કયો છે?",
    //   "a": "જન ગણ મન",
    //   "b": "વંદે માતરમ",
    //   "c": "સન્નિધિ સ્તુતિ",
    //   "d": "સરસ્વતી વિજયામહે",
    //   "complexity": "સહજ",
    //   "categoryId": "123abc45-678d-90ef-11ab-ccddee99",
    //   "categoryName": "ભારતીય સંસ્કૃતિ",
    //   "description": "આલ્જિબ્રામાં મૌલિક ગણિત પ્રશ્ન.",
    // },

    // {
    //   "id": "727aa50e-5226-417c-83ee-c85a927f7982",
    //   "question": "https://cdn.pixabay.com/photo/2024/11/07/18/48/sofa-9181557_1280.jpg",
    //   "a": "https://cdn.pixabay.com/photo/2024/11/07/18/48/sofa-9181557_1280.jpg",
    //   "b": "https://cdn.pixabay.com/photo/2024/11/07/18/48/sofa-9181557_1280.jpg",
    //   "c": "https://cdn.pixabay.com/photo/2024/11/07/18/48/sofa-9181557_1280.jpg",
    //   "d": "https://cdn.pixabay.com/photo/2024/11/07/18/48/sofa-9181557_1280.jpg",
    //   "complexity": "Easy",
    //   "categoryId": "bd913d6f-4c30-41e1-a8ad-a7d471429565",
    //   "categoryName": "Algebra",
    //   "description": "Basic arithmetic question in algebra."
    // },

    // {
    //   "id": "c494e72d-19dd-422d-8276-6b6f54ecaa27",
    //   "question": "What is 2 + 2?",
    //   "a": "4",
    //   "b": "3",
    //   "c": "5",
    //   "d": "6",
    //   "complexity": "Easy",
    //   "categoryId": "bd913d6f-4c30-41e1-a8ad-a7d471429565",
    //   "categoryName": "Algebra",
    //   "description": "Basic arithmetic question in algebra."
    // },
    // {
    //   "id": "7cbb966b-cff8-402c-9818-ee65ab6b6659",
    //   "question": "What is the value of x in the equation x + 3 = 7?",
    //   "a": "x = 5",
    //   "b": "x = 4",
    //   "c": "x = 3",
    //   "d": "x = 6",
    //   "complexity": "Medium",
    //   "categoryId": "bd913d6f-4c30-41e1-a8ad-a7d471429565",
    //   "categoryName": "Algebra",
    //   "description": "Basic linear equation solving in algebra."
    // },
    // {
    //   "id": "d041d09a-e574-4558-936f-18d028f5d687",
    //   "question": "Solve for x: x² - 5x + 6 = 0",
    //   "a": "x = 1",
    //   "b": "x = 2",
    //   "c": "x = -1",
    //   "d": "x = 3",
    //   "complexity": "Hard",
    //   "categoryId": "bd913d6f-4c30-41e1-a8ad-a7d471429565",
    //   "categoryName": "Algebra",
    //   "description": "Solving a quadratic equation in algebra."
    // },
    // {
    //   "id": "0a36bea1-8613-4318-aeab-537cb2a47e0e",
    //   "question": "What is the derivative of x²?",
    //   "a": "2x",
    //   "b": "x²",
    //   "c": "x",
    //   "d": "x³",
    //   "complexity": "Easy",
    //   "categoryId": "80cab758-530f-4409-bec8-df5d10c67728",
    //   "categoryName": "Calculus",
    //   "description": "Basic derivative rule in Calculus."
    // },
    // {
    //   "id": "875a87fe-abf3-489e-b303-4b8479f8089b",
    //   "question": "What is the integral of 1/x?",
    //   "a": "ln(x)",
    //   "b": "e^x",
    //   "c": "x²",
    //   "d": "1/x²",
    //   "complexity": "Medium",
    //   "categoryId": "80cab758-530f-4409-bec8-df5d10c67728",
    //   "categoryName": "Calculus",
    //   "description": "Basic integration rule for logarithmic functions."
    // },
    // {
    //   "id": "9c594de5-2640-435b-8e71-6e651fbaf87c",
    //   "question": "Find the limit of (sin(x))/x as x approaches 0.",
    //   "a": "1",
    //   "b": "0",
    //   "c": "Infinity",
    //   "d": "Does not exist",
    //   "complexity": "Hard",
    //   "categoryId": "80cab758-530f-4409-bec8-df5d10c67728",
    //   "categoryName": "Calculus",
    //   "description": "Limit concept in calculus involving trigonometric functions."
    // },
    // {
    //   "id": "be8ebb38-18ee-45ec-91dc-ff0d399b90e1",
    //   "question": "What is the sum of the angles in a triangle?",
    //   "a": "90°",
    //   "b": "180°",
    //   "c": "360°",
    //   "d": "270°",
    //   "complexity": "Easy",
    //   "categoryId": "da572a67-12c2-4814-a3be-994c4ac92d12",
    //   "categoryName": "Geography",
    //   "description": "Basic property of triangles in geometry."
    // },
    // {
    //   "id": "261dcfba-3583-4869-b6d3-a35851d3da86",
    //   "question": "What is the area of a circle with radius 7?",
    //   "a": "49π",
    //   "b": "14π",
    //   "c": "49",
    //   "d": "14",
    //   "complexity": "Medium",
    //   "categoryId": "da572a67-12c2-4814-a3be-994c4ac92d12",
    //   "categoryName": "Geography",
    //   "description": "Using the formula for area of a circle, A = πr²."
    // },
    // {
    //   "id": "459262e9-d560-4aab-b8dd-7ac8fc6cabdf",
    //   "question": "What is the volume of a sphere with radius 5?",
    //   "a": "100π/3",
    //   "b": "500π/3",
    //   "c": "250π/3",
    //   "d": "150π/3",
    //   "complexity": "Hard",
    //   "categoryId": "da572a67-12c2-4814-a3be-994c4ac92d12",
    //   "categoryName": "Geography",
    //   "description": "Formula for the volume of a sphere, V = (4/3)πr³."
    // },
    // {
    //   "id": "bbe5b9c1-1498-465d-aff0-6659d73222d3",
    //   "question": "What is the unit of force?",
    //   "a": "Newton",
    //   "b": "Joule",
    //   "c": "Pascal",
    //   "d": "Watt",
    //   "complexity": "Easy",
    //   "categoryId": "c88c0d14-18fb-4802-a405-10f47d1469bb",
    //   "categoryName": "Physics",
    //   "description": "Basic unit of force in physics."
    // },
    // {
    //   "id": "6121510f-f8c6-43df-9b85-54800a68c820",
    //   "question": "What is the formula for calculating kinetic energy?",
    //   "a": "½mv²",
    //   "b": "mv²",
    //   "c": "½m²v",
    //   "d": "m²v²",
    //   "complexity": "Medium",
    //   "categoryId": "c88c0d14-18fb-4802-a405-10f47d1469bb",
    //   "categoryName": "Physics",
    //   "description": "The formula for kinetic energy, where m is mass and v is velocity."
    // },
    // {
    //   "id": "aade31dc-678b-4def-befd-17854c7568b6",
    //   "question": "What is the value of gravitational constant (G)?",
    //   "a": "6.67 × 10^-11 N·m²/kg²",
    //   "b": "9.8 m/s²",
    //   "c": "1.6 × 10^-19 C",
    //   "d": "3.14",
    //   "complexity": "Hard",
    //   "categoryId": "c88c0d14-18fb-4802-a405-10f47d1469bb",
    //   "categoryName": "Physics",
    //   "description": "The universal gravitational constant in physics."
    // },
    // {
    //   "id": "4a008f62-fa72-4a87-a81a-8fc00180aeed",
    //   "question": "What is the chemical symbol for water?",
    //   "a": "H2O",
    //   "b": "CO2",
    //   "c": "O2",
    //   "d": "H2",
    //   "complexity": "Easy",
    //   "categoryId": "2c00a9c6-a049-46cf-9232-23d3d46972d3",
    //   "categoryName": "Chemistry",
    //   "description": "The chemical formula for water."
    // },
    // {
    //   "id": "8834f544-8b95-4307-8b2d-48669eafbfde",
    //   "question": "What is the atomic number of Carbon?",
    //   "a": "6",
    //   "b": "8",
    //   "c": "12",
    //   "d": "14",
    //   "complexity": "Medium",
    //   "categoryId": "2c00a9c6-a049-46cf-9232-23d3d46972d3",
    //   "categoryName": "Chemistry",
    //   "description": "The atomic number of Carbon is the number of protons in its nucleus."
    // },
    // {
    //   "id": "30e06d0d-105a-4cdb-9eae-19ffb8977815",
    //   "question": "Which of the following is a noble gas?",
    //   "a": "Oxygen",
    //   "b": "Nitrogen",
    //   "c": "Helium",
    //   "d": "Carbon",
    //   "complexity": "Hard",
    //   "categoryId": "2c00a9c6-a049-46cf-9232-23d3d46972d3",
    //   "categoryName": "Chemistry",
    //   "description": "Noble gases are elements with a full outer shell of electrons, making them stable."
    // },
    // {
    //   "id": "e66bd5d1-e747-42c5-87e6-04f6db6fdebe",
    //   "question": "What is the powerhouse of the cell?",
    //   "a": "Mitochondria",
    //   "b": "Nucleus",
    //   "c": "Ribosome",
    //   "d": "Golgi Apparatus",
    //   "complexity": "Easy",
    //   "categoryId": "e088d939-9d36-4eb0-8426-770fd1f6029e",
    //   "categoryName": "Biology",
    //   "description": "The organelle responsible for energy production in a cell."
    // },
    // {
    //   "id": "4c73205c-d245-404b-986d-6140783caaac",
    //   "question": "What is the basic unit of heredity?",
    //   "a": "Gene",
    //   "b": "Chromosome",
    //   "c": "DNA",
    //   "d": "RNA",
    //   "complexity": "Medium",
    //   "categoryId": "e088d939-9d36-4eb0-8426-770fd1f6029e",
    //   "categoryName": "Biology",
    //   "description": "Genes are the units of heredity that carry information from one generation to the next."
    // },
    // {
    //   "id": "897cf20e-23b4-41c3-8eb5-d435e5cfbfc0",
    //   "question": "Which of the following is NOT a characteristic of all living organisms?",
    //   "a": "Growth",
    //   "b": "Reproduction",
    //   "c": "Ability to move",
    //   "d": "Metabolism",
    //   "complexity": "Hard",
    //   "categoryId": "e088d939-9d36-4eb0-8426-770fd1f6029e",
    //   "categoryName": "Biology",
    //   "description": "All living organisms share common characteristics, but not all can move on their own."
    // },
    // {
    //   "id": "6bc31324-1734-438f-b23f-e017dcd47831",
    //   "question": "Who was the first emperor of China?",
    //   "a": "Qin Shi Huang",
    //   "b": "Liu Bang",
    //   "c": "Han Wudi",
    //   "d": "Emperor Wu",
    //   "complexity": "Easy",
    //   "categoryId": "02883e6a-adcd-4159-bbe8-1079c06aeb31",
    //   "categoryName": "Ancient History",
    //   "description": "Qin Shi Huang was the first emperor of unified China in 221 BC."
    // },
    // {
    //   "id": "e331df84-b502-4e81-a5c0-ae33171ec3b1",
    //   "question": "The Great Pyramid of Giza was built during which Egyptian dynasty?",
    //   "a": "Old Kingdom",
    //   "b": "Middle Kingdom",
    //   "c": "New Kingdom",
    //   "d": "Ptolemaic Dynasty",
    //   "complexity": "Medium",
    //   "categoryId": "02883e6a-adcd-4159-bbe8-1079c06aeb31",
    //   "categoryName": "Ancient History",
    //   "description": "The Great Pyramid was built during the Fourth Dynasty of the Old Kingdom in Egypt."
    // },
    // {
    //   "id": "01cdad8f-595b-4963-88d7-e94fa015a9f4",
    //   "question": "Which of these civilizations is credited with inventing the first form of writing?",
    //   "a": "Sumerians",
    //   "b": "Egyptians",
    //   "c": "Indus Valley",
    //   "d": "Minoans",
    //   "complexity": "Hard",
    //   "categoryId": "02883e6a-adcd-4159-bbe8-1079c06aeb31",
    //   "categoryName": "Ancient History",
    //   "description": "The Sumerians are credited with inventing cuneiform writing around 3500 BC."
    // },
    // {
    //   "id": "e5e48c32-5148-483a-8c39-00bedead7bc3",
    //   "question": "Who was the king of England during the Battle of Hastings?",
    //   "a": "William the Conqueror",
    //   "b": "King Harold II",
    //   "c": "King Richard I",
    //   "d": "King John",
    //   "complexity": "Easy",
    //   "categoryId": "db975fdf-2214-4c5f-9302-5511eeb98cbf",
    //   "categoryName": "Medieval History",
    //   "description": "The Battle of Hastings in 1066 was fought between the forces of William the Conqueror and King Harold II of England."
    // },
    // {
    //   "id": "621e5c06-f5f9-4f44-aaba-0d83c00b418e",
    //   "question": "Which event marked the beginning of the Hundred Years' War?",
    //   "a": "Battle of Agincourt",
    //   "b": "Signing of the Magna Carta",
    //   "c": "Battle of Crécy",
    //   "d": "The Battle of St. Albans",
    //   "complexity": "Medium",
    //   "categoryId": "db975fdf-2214-4c5f-9302-5511eeb98cbf",
    //   "categoryName": "Medieval History",
    //   "description": "The Hundred Years' War began in 1337 when Edward III claimed the French throne, leading to the conflict between England and France."
    // },
    // {
    //   "id": "b522e791-302e-4973-886e-23e57d8fff47",
    //   "question": "Which of the following was a key feature of the Black Death?",
    //   "a": "Spread via trade routes",
    //   "b": "Originated in North America",
    //   "c": "Affecting only peasants",
    //   "d": "Occurred during the Renaissance",
    //   "complexity": "Hard",
    //   "categoryId": "db975fdf-2214-4c5f-9302-5511eeb98cbf",
    //   "categoryName": "Medieval History",
    //   "description": "The Black Death, which struck Europe in the 14th century, spread through trade routes and killed millions of people across the continent."
    // },
    // {
    //   "id": "d427e0e0-3404-446f-a028-9219deb63c63",
    //   "question": "Who was the leader of the Soviet Union during World War II?",
    //   "a": "Joseph Stalin",
    //   "b": "Vladimir Lenin",
    //   "c": "Nikita Khrushchev",
    //   "d": "Leonid Brezhnev",
    //   "complexity": "Easy",
    //   "categoryId": "9b0449b2-054d-43f9-b630-50e6a670b9f0",
    //   "categoryName": "Modern History",
    //   "description": "Joseph Stalin was the leader of the Soviet Union during World War II and played a crucial role in the Allied victory over Nazi Germany."
    // },
    // {
    //   "id": "282876c6-8866-4a6f-9541-5fddae25a26e",
    //   "question": "Which event marked the start of the Cold War?",
    //   "a": "Berlin Blockade",
    //   "b": "Yalta Conference",
    //   "c": "Cuban Missile Crisis",
    //   "d": "End of WWII",
    //   "complexity": "Medium",
    //   "categoryId": "9b0449b2-054d-43f9-b630-50e6a670b9f0",
    //   "categoryName": "Modern History",
    //   "description": "The Berlin Blockade (1948-1949) was one of the first major crises of the Cold War and set the stage for the conflict between the United States and the Soviet Union."
    // },
    // {
    //   "id": "f22e5683-9ec2-4d9b-98a2-53875ce1d946",
    //   "question": "What was the purpose of the Marshall Plan after WWII?",
    //   "a": "To rebuild European economies",
    //   "b": "To establish NATO",
    //   "c": "To divide Germany",
    //   "d": "To end the Great Depression",
    //   "complexity": "Hard",
    //   "categoryId": "9b0449b2-054d-43f9-b630-50e6a670b9f0",
    //   "categoryName": "Modern History",
    //   "description": "The Marshall Plan (1948) was a U.S. program to aid in the reconstruction of Europe after World War II by providing financial assistance to war-torn countries."
    // },
    // {
    //   "id": "a4767ac5-90a6-409a-946b-0ed5a91d6d28",
    //   "question": "What is the largest country by land area in the world?",
    //   "a": "Russia",
    //   "b": "Canada",
    //   "c": "United States",
    //   "d": "China",
    //   "complexity": "Easy",
    //   "categoryId": "0ddc99c9-7bb7-4217-9954-9020caff1ca7",
    //   "categoryName": "World Geography",
    //   "description": "Russia is the largest country in the world by land area, covering over 17 million square kilometers."
    // },
    // {
    //   "id": "c18eab15-2b47-4359-86ea-3ad2f549e034",
    //   "question": "Which country has the longest coastline in the world?",
    //   "a": "Australia",
    //   "b": "Canada",
    //   "c": "Russia",
    //   "d": "United States",
    //   "complexity": "Medium",
    //   "categoryId": "0ddc99c9-7bb7-4217-9954-9020caff1ca7",
    //   "categoryName": "World Geography",
    //   "description": "Canada has the longest coastline in the world, stretching over 202,080 kilometers."
    // },
    // {
    //   "id": "07be8571-c7c6-47ec-a904-03433554b10b",
    //   "question": "What is the capital city of Brazil?",
    //   "a": "São Paulo",
    //   "b": "Brasília",
    //   "c": "Rio de Janeiro",
    //   "d": "Buenos Aires",
    //   "complexity": "Hard",
    //   "categoryId": "0ddc99c9-7bb7-4217-9954-9020caff1ca7",
    //   "categoryName": "World Geography",
    //   "description": "Brasília, the capital of Brazil, was inaugurated in 1960 and was designed by architect Oscar Niemeyer."
    // },
    // {
    //   "id": "adb30436-b570-4133-a342-6cda7e4223be",
    //   "question": "What is the name of the largest desert in the world?",
    //   "a": "Sahara Desert",
    //   "b": "Gobi Desert",
    //   "c": "Kalahari Desert",
    //   "d": "Antarctic Desert",
    //   "complexity": "Easy",
    //   "categoryId": "68f2059c-8d61-43c3-91ae-8fac5d976e56",
    //   "categoryName": "Physical Geography",
    //   "description": "The Antarctic Desert is the largest desert in the world by area, covering about 14 million square kilometers."
    // },
    // {
    //   "id": "0ef177c4-064e-4616-8fbe-1375831c9368",
    //   "question": "Which ocean is the largest by surface area?",
    //   "a": "Atlantic Ocean",
    //   "b": "Indian Ocean",
    //   "c": "Southern Ocean",
    //   "d": "Pacific Ocean",
    //   "complexity": "Medium",
    //   "categoryId": "68f2059c-8d61-43c3-91ae-8fac5d976e56",
    //   "categoryName": "Physical Geography",
    //   "description": "The Pacific Ocean is the largest and deepest ocean, covering more than 63 million square miles."
    // },
    // {
    //   "id": "dd2e68c3-8062-40bf-8254-60e1af8a1107",
    //   "question": "What is the highest mountain in the world by elevation above sea level?",
    //   "a": "K2",
    //   "b": "Mount Everest",
    //   "c": "Kangchenjunga",
    //   "d": "Lhotse",
    //   "complexity": "Hard",
    //   "categoryId": "68f2059c-8d61-43c3-91ae-8fac5d976e56",
    //   "categoryName": "Physical Geography",
    //   "description": "Mount Everest, located in the Himalayas, has an elevation of 8,848 meters (29,029 feet) above sea level."
    // },
    // {
    //   "id": "f34cebd6-3aec-452a-bb65-163ad350cbf7",
    //   "question": "Which country has the largest number of neighboring countries?",
    //   "a": "Russia",
    //   "b": "China",
    //   "c": "Brazil",
    //   "d": "India",
    //   "complexity": "Easy",
    //   "categoryId": "ee8682c4-7c03-49b3-be75-16880b192630",
    //   "categoryName": "Political Geography",
    //   "description": "Russia shares land borders with 16 countries, the most of any country in the world."
    // },
    // {
    //   "id": "8e368189-dc05-4e9f-b58d-3c559adcca57",
    //   "question": "What is the capital city of Australia?",
    //   "a": "Sydney",
    //   "b": "Melbourne",
    //   "c": "Canberra",
    //   "d": "Brisbane",
    //   "complexity": "Medium",
    //   "categoryId": "ee8682c4-7c03-49b3-be75-16880b192630",
    //   "categoryName": "Political Geography",
    //   "description": "Canberra is the capital city of Australia, situated between Sydney and Melbourne."
    // },
    // {
    //   "id": "9c61eb3d-8133-4736-a3ad-7218801148ff",
    //   "question": "Which country is landlocked but has a coastline along the Caspian Sea?",
    //   "a": "Kazakhstan",
    //   "b": "Uzbekistan",
    //   "c": "Turkmenistan",
    //   "d": "Armenia",
    //   "complexity": "Hard",
    //   "categoryId": "ee8682c4-7c03-49b3-be75-16880b192630",
    //   "categoryName": "Political Geography",
    //   "description": "Kazakhstan is landlocked, but it has a coastline along the Caspian Sea, the worlds largest inland body of water."
    // },
    // {
    //   "id": "bc3441c1-8644-4f37-b023-b01b63158f3c",
    //   "question": "Who wrote the play \"Romeo and Juliet\"?",
    //   "a": "William Shakespeare",
    //   "b": "Charles Dickens",
    //   "c": "Jane Austen",
    //   "d": "Mark Twain",
    //   "complexity": "Easy",
    //   "categoryId": "0e1f5764-1bb5-4f1c-b5c2-93a721e758b5",
    //   "categoryName": "English Literature",
    //   "description": "The play \"Romeo and Juliet\" was written by William Shakespeare in the early stages of his career."
    // },
    // {
    //   "id": "5cdd3a4e-aeef-4db7-869e-dfae0a76d67d",
    //   "question": "Which novel is considered to be the first science fiction novel?",
    //   "a": "Frankenstein",
    //   "b": "1984",
    //   "c": "The War of the Worlds",
    //   "d": "The Time Machine",
    //   "complexity": "Medium",
    //   "categoryId": "0e1f5764-1bb5-4f1c-b5c2-93a721e758b5",
    //   "categoryName": "English Literature",
    //   "description": "The novel \"Frankenstein\" by Mary Shelley is often considered the first science fiction novel, written in 1818."
    // },
    // {
    //   "id": "d83dc3d6-3c81-4b5d-aaba-9fab888bea8e",
    //   "question": "Who wrote \"The Waste Land\"?",
    //   "a": "T.S. Eliot",
    //   "b": "Ezra Pound",
    //   "c": "Virginia Woolf",
    //   "d": "James Joyce",
    //   "complexity": "Hard",
    //   "categoryId": "0e1f5764-1bb5-4f1c-b5c2-93a721e758b5",
    //   "categoryName": "English Literature",
    //   "description": "T.S. Eliot is the author of \"The Waste Land,\" a major poem of the 20th century that reflects the disillusionment of the post-World War I era."
    // },
    // {
    //   "id": "04218e1c-3cd5-4cbc-a0a6-b5beece90b05",
    //   "question": "Who wrote the novel \"One Hundred Years of Solitude\"?",
    //   "a": "Gabriel García Márquez",
    //   "b": "Pablo Neruda",
    //   "c": "Carlos Fuentes",
    //   "d": "Mario Vargas Llosa",
    //   "complexity": "Easy",
    //   "categoryId": "681f113c-5a5f-45fd-b156-1a77454d7da1",
    //   "categoryName": "World Literature",
    //   "description": "The novel \"One Hundred Years of Solitude\" was written by Colombian author Gabriel García Márquez, one of the most significant authors in Latin American literature."
    // },
    // {
    //   "id": "fea4197e-b350-42a9-9165-6a9bf8969b48",
    //   "question": "Which epic poem is attributed to Homer?",
    //   "a": "The Iliad",
    //   "b": "The Aeneid",
    //   "c": "The Divine Comedy",
    //   "d": "Beowulf",
    //   "complexity": "Medium",
    //   "categoryId": "681f113c-5a5f-45fd-b156-1a77454d7da1",
    //   "categoryName": "World Literature",
    //   "description": "The \"Iliad\" is an ancient Greek epic poem attributed to the poet Homer, focusing on the events of the Trojan War."
    // },
    // {
    //   "id": "4c491849-c1b2-42e0-bfad-b27022b75d01",
    //   "question": "Who wrote \"The Brothers Karamazov\"?",
    //   "a": "Fyodor Dostoevsky",
    //   "b": "Leo Tolstoy",
    //   "c": "Anton Chekhov",
    //   "d": "Maxim Gorky",
    //   "complexity": "Hard",
    //   "categoryId": "681f113c-5a5f-45fd-b156-1a77454d7da1",
    //   "categoryName": "World Literature",
    //   "description": "Fyodor Dostoevsky, a Russian novelist, wrote \"The Brothers Karamazov,\" exploring themes of faith, doubt, and morality."
    // },
    // {
    //   "id": "ab73bd17-1135-4a7c-a719-1f98d75cf89f",
    //   "question": "Who wrote the novel \"The Great Gatsby\"?",
    //   "a": "F. Scott Fitzgerald",
    //   "b": "Ernest Hemingway",
    //   "c": "Mark Twain",
    //   "d": "John Steinbeck",
    //   "complexity": "Easy",
    //   "categoryId": "c8d0e8bc-bf3c-49a0-83a8-6c4849449806",
    //   "categoryName": "American Literature",
    //   "description": "The Great Gatsby is a novel by American author F. Scott Fitzgerald, set in the 1920s and explores themes of wealth, love, and the American Dream."
    // },
    // {
    //   "id": "d742831e-2ff3-486e-9ae5-53becc84f872",
    //   "question": "Which novel by Herman Melville is considered one of the greatest works of American literature?",
    //   "a": "Moby-Dick",
    //   "b": "The Scarlet Letter",
    //   "c": "Huckleberry Finn",
    //   "d": "The Catcher in the Rye",
    //   "complexity": "Medium",
    //   "categoryId": "c8d0e8bc-bf3c-49a0-83a8-6c4849449806",
    //   "categoryName": "American Literature",
    //   "description": "Moby-Dick is a novel by Herman Melville, and it is considered one of the greatest works of American literature, exploring complex themes of obsession and the human condition."
    // },
    // {
    //   "id": "f42883e5-60d1-470f-91de-5f6cd165f784",
    //   "question": "Who is the author of \"Beloved,\" a novel about the legacy of slavery?",
    //   "a": "Toni Morrison",
    //   "b": "Alice Walker",
    //   "c": "Maya Angelou",
    //   "d": "Zora Neale Hurston",
    //   "complexity": "Hard",
    //   "categoryId": "c8d0e8bc-bf3c-49a0-83a8-6c4849449806",
    //   "categoryName": "American Literature",
    //   "description": "Toni Morrison wrote \"Beloved,\" a powerful narrative about the traumatic legacy of slavery and its effects on the African-American community."
    // },
    // {
    //   "id": "59b9aabe-a767-4e8e-964c-877bcd5ff0c1",
    //   "question": "What is the primary function of the CPU in a computer?",
    //   "a": "Perform calculations",
    //   "b": "Store data",
    //   "c": "Provide input",
    //   "d": "Display output",
    //   "complexity": "Easy",
    //   "categoryId": "7139392a-41e8-4d9a-af14-af596d0699d0",
    //   "categoryName": "Computer Science",
    //   "description": "The CPU (Central Processing Unit) is responsible for performing calculations and executing instructions in a computer."
    // },
    // {
    //   "id": "86d5657d-14e3-4264-8857-ab5419caecca",
    //   "question": "Which programming language is known for its use in web development?",
    //   "a": "Python",
    //   "b": "Java",
    //   "c": "JavaScript",
    //   "d": "C++",
    //   "complexity": "Medium",
    //   "categoryId": "7139392a-41e8-4d9a-af14-af596d0699d0",
    //   "categoryName": "Computer Science",
    //   "description": "JavaScript is a programming language commonly used in web development to create interactive and dynamic web pages."
    // },
    // {
    //   "id": "aad96608-d758-48b2-9a98-5cf7e9b75c03",
    //   "question": "Which algorithm is used to sort a list of numbers in ascending order with the least complexity?",
    //   "a": "Bubble Sort",
    //   "b": "Merge Sort",
    //   "c": "Quick Sort",
    //   "d": "Insertion Sort",
    //   "complexity": "Hard",
    //   "categoryId": "7139392a-41e8-4d9a-af14-af596d0699d0",
    //   "categoryName": "Computer Science",
    //   "description": "Merge Sort is a divide-and-conquer algorithm that has a time complexity of O(n log n), making it efficient for large datasets."
    // },
    // {
    //   "id": "19543805-c8d5-482c-8928-9d515dbcd03a",
    //   "question": "What does AI stand for?",
    //   "a": "Automated Intelligence",
    //   "b": "Artificial Intelligence",
    //   "c": "Automobile Intelligence",
    //   "d": "Advanced Interface",
    //   "complexity": "Easy",
    //   "categoryId": "a315300f-4199-4a53-9e64-9c17a98baaf7",
    //   "categoryName": "Artificial Intelligence",
    //   "description": "AI stands for Artificial Intelligence, a field of computer science focused on creating intelligent machines that can perform tasks that typically require human intelligence."
    // },
    // {
    //   "id": "e6c20dc3-f033-41d3-87a5-a01f47ae8a69",
    //   "question": "Which of the following is a type of supervised learning?",
    //   "a": "K-Means Clustering",
    //   "b": "Linear Regression",
    //   "c": "Principal Component Analysis",
    //   "d": "Deep Learning",
    //   "complexity": "Medium",
    //   "categoryId": "a315300f-4199-4a53-9e64-9c17a98baaf7",
    //   "categoryName": "Artificial Intelligence",
    //   "description": "Linear Regression is a supervised learning algorithm used for predicting continuous values based on the input features."
    // },
    // {
    //   "id": "73c884a0-644a-4785-82a2-8633b58149b6",
    //   "question": "Which of the following is a challenge in AI development?",
    //   "a": "Lack of data",
    //   "b": "Overfitting",
    //   "c": "Hardware limitations",
    //   "d": "All of the above",
    //   "complexity": "Hard",
    //   "categoryId": "a315300f-4199-4a53-9e64-9c17a98baaf7",
    //   "categoryName": "Artificial Intelligence",
    //   "description": "Challenges in AI development include issues like lack of data, overfitting, and hardware limitations that hinder the performance of AI models."
    // },
    // {
    //   "id": "fb006f2c-c4cb-43a7-b6d1-f54232121362",
    //   "question": "What is the main purpose of a firewall?",
    //   "a": "To store data securely",
    //   "b": "To block unauthorized access",
    //   "c": "To enhance system speed",
    //   "d": "To encrypt data",
    //   "complexity": "Easy",
    //   "categoryId": "ab7d15c0-9450-4826-a8fb-a3c66be7810f",
    //   "categoryName": "Cybersecurity",
    //   "description": "A firewall is a network security system designed to prevent unauthorized access while allowing legitimate communication."
    // },
    // {
    //   "id": "95f0f5ed-e483-4b51-a91f-0c70ff02d3c0",
    //   "question": "Which type of malware is designed to replicate itself and spread to other systems?",
    //   "a": "Ransomware",
    //   "b": "Virus",
    //   "c": "Trojan",
    //   "d": "Spyware",
    //   "complexity": "Medium",
    //   "categoryId": "ab7d15c0-9450-4826-a8fb-a3c66be7810f",
    //   "categoryName": "Cybersecurity",
    //   "description": "A virus is a type of malware that is designed to replicate itself and spread to other computers or networks."
    // },
    // {
    //   "id": "ead62011-cdac-49c7-8014-193ff7839dbd",
    //   "question": "What does two-factor authentication (2FA) provide?",
    //   "a": "It makes passwords longer",
    //   "b": "It requires two passwords",
    //   "c": "It adds a second layer of security",
    //   "d": "It requires biometric identification",
    //   "complexity": "Hard",
    //   "categoryId": "ab7d15c0-9450-4826-a8fb-a3c66be7810f",
    //   "categoryName": "Cybersecurity",
    //   "description": "Two-factor authentication (2FA) adds an extra layer of security by requiring two forms of verification, such as a password and a code sent to a mobile device."
    // },
    // {
    //   "id": "47e895d7-1771-4cb2-84b5-b2a718bb55a9",
    //   "question": "Which of the following is a synonym of \"happy\"?",
    //   "a": "Sad",
    //   "b": "Joyful",
    //   "c": "Angry",
    //   "d": "Bored",
    //   "complexity": "Easy",
    //   "categoryId": "50572e5d-abd3-4458-abab-7a09626e474b",
    //   "categoryName": "English Language",
    //   "description": "The word \"joyful\" is a synonym of \"happy\", as both describe a positive emotional state."
    // },
    // {
    //   "id": "e12bc9bf-8e63-4212-bddc-7088c3dab641",
    //   "question": "What is the correct past tense of the verb \"to go\"?",
    //   "a": "Going",
    //   "b": "Went",
    //   "c": "Gone",
    //   "d": "Go",
    //   "complexity": "Medium",
    //   "categoryId": "50572e5d-abd3-4458-abab-7a09626e474b",
    //   "categoryName": "English Language",
    //   "description": "The correct past tense form of the verb \"to go\" is \"went\"."
    // },
    // {
    //   "id": "e8b75d85-7068-453e-9103-4d7f96af2dbc",
    //   "question": "Which of the following sentences is grammatically correct?",
    //   "a": "She can sings well.",
    //   "b": "She can sing well.",
    //   "c": "She can sang well.",
    //   "d": "She can singing well.",
    //   "complexity": "Hard",
    //   "categoryId": "50572e5d-abd3-4458-abab-7a09626e474b",
    //   "categoryName": "English Language",
    //   "description": "The correct sentence is \"She can sing well.\" The modal verb \"can\" is followed by the base form of the verb."
    // },
    // {
    //   "id": "05313d05-19dd-449b-b412-0eb199ddbe25",
    //   "question": "How do you say \"hello\" in Spanish?",
    //   "a": "Bonjour",
    //   "b": "Hola",
    //   "c": "Ciao",
    //   "d": "Hallo",
    //   "complexity": "Easy",
    //   "categoryId": "548afee9-70a6-4eaf-acf2-7f67170bd5f0",
    //   "categoryName": "Spanish Language",
    //   "description": "In Spanish, \"hello\" is translated as \"Hola\"."
    // },
    // {
    //   "id": "a89e6e76-fd1b-46c0-901e-186401f88fc2",
    //   "question": "What is the Spanish word for \"apple\"?",
    //   "a": "Pera",
    //   "b": "Manzana",
    //   "c": "Uva",
    //   "d": "Cereza",
    //   "complexity": "Medium",
    //   "categoryId": "548afee9-70a6-4eaf-acf2-7f67170bd5f0",
    //   "categoryName": "Spanish Language",
    //   "description": "The Spanish word for \"apple\" is \"Manzana\"."
    // },
    // {
    //   "id": "4cd47b28-4ee1-4a54-a89c-fae208ab82d4",
    //   "question": "Which of the following is the correct form of the verb \"to be\" in the past tense for \"yo\"?",
    //   "a": "Estoy",
    //   "b": "Seré",
    //   "c": "Era",
    //   "d": "Fui",
    //   "complexity": "Hard",
    //   "categoryId": "548afee9-70a6-4eaf-acf2-7f67170bd5f0",
    //   "categoryName": "Spanish Language",
    //   "description": "The correct past tense form of \"to be\" for \"yo\" is \"Era\"."
    // },
    // {
    //   "id": "f8b6657c-fd7f-471f-b026-4a3d1fe9d6b9",
    //   "question": "How do you say \"good morning\" in French?",
    //   "a": "Bonjour",
    //   "b": "Buenas noches",
    //   "c": "Guten Morgen",
    //   "d": "Ciao",
    //   "complexity": "Easy",
    //   "categoryId": "3bf8b21c-d84e-4799-913c-52571d56e23b",
    //   "categoryName": "French Language",
    //   "description": "In French, \"good morning\" is translated as \"Bonjour\"."
    // },
    // {
    //   "id": "d0002931-616f-49f9-a04e-9089c8c61453",
    //   "question": "What is the French word for \"book\"?",
    //   "a": "Livre",
    //   "b": "Libro",
    //   "c": "Buch",
    //   "d": "Leitura",
    //   "complexity": "Medium",
    //   "categoryId": "3bf8b21c-d84e-4799-913c-52571d56e23b",
    //   "categoryName": "French Language",
    //   "description": "The French word for \"book\" is \"Livre\"."
    // },
    // {
    //   "id": "9782edc9-fe1a-4a75-9600-1c85cc565e24",
    //   "question": "Which of the following is the correct form of the verb \"to be\" in the past tense for \"nous\"?",
    //   "a": "Sont",
    //   "b": "Étions",
    //   "c": "Étaient",
    //   "d": "Avons été",
    //   "complexity": "Hard",
    //   "categoryId": "3bf8b21c-d84e-4799-913c-52571d56e23b",
    //   "categoryName": "French Language",
    //   "description": "The correct past tense form of \"to be\" for \"nous\" is \"Étions\"."
    // },
    // {
    //   "id": "492fa1a5-1dbe-4f0a-95aa-c60d219065a8",
    //   "question": "What does the law of demand state?",
    //   "a": "As the price increases, demand decreases",
    //   "b": "As the price increases, demand increases",
    //   "c": "As the price decreases, demand decreases",
    //   "d": "Demand is independent of price",
    //   "complexity": "Easy",
    //   "categoryId": "0a896648-b7af-425c-97ec-ffa6799b367e",
    //   "categoryName": "Microeconomics",
    //   "description": "The law of demand states that as the price of a good increases, the quantity demanded decreases, and vice versa."
    // },
    // {
    //   "id": "84373466-05c5-4045-944f-b057a7ee60e3",
    //   "question": "Which of the following is an example of a price ceiling?",
    //   "a": "Minimum wage law",
    //   "b": "Rent control",
    //   "c": "Sales tax",
    //   "d": "Subsidies for farmers",
    //   "complexity": "Medium",
    //   "categoryId": "0a896648-b7af-425c-97ec-ffa6799b367e",
    //   "categoryName": "Microeconomics",
    //   "description": "A price ceiling is a legal maximum price for a good or service, such as rent control laws."
    // },
    // {
    //   "id": "f77c163b-6cff-4297-b5f4-561c01ab6c58",
    //   "question": "In perfect competition, what happens in the long run?",
    //   "a": "Firms make economic profits",
    //   "b": "Firms make zero economic profits",
    //   "c": "Firms exit the market",
    //   "d": "Firms can influence market prices",
    //   "complexity": "Hard",
    //   "categoryId": "0a896648-b7af-425c-97ec-ffa6799b367e",
    //   "categoryName": "Microeconomics",
    //   "description": "In perfect competition, firms will enter or exit the market until they make zero economic profits in the long run."
    // },
    // {
    //   "id": "f0756573-dbcd-44b5-8de4-6d1aeafa90a4",
    //   "question": "What is GDP?",
    //   "a": "Gross Domestic Product",
    //   "b": "Gross Domestic Purchase",
    //   "c": "Global Development Price",
    //   "d": "Gross Development Percentage",
    //   "complexity": "Easy",
    //   "categoryId": "d55547fc-89ca-4077-912b-15182a9dbd1d",
    //   "categoryName": "Macroeconomics",
    //   "description": "GDP stands for Gross Domestic Product, the total value of all goods and services produced in a country during a specific period of time."
    // },
    // {
    //   "id": "df3c460a-4200-4745-bdb1-34a6fb4af07e",
    //   "question": "Which of the following is an example of fiscal policy?",
    //   "a": "Changing the interest rate",
    //   "b": "Adjusting government spending",
    //   "c": "Changing the exchange rate",
    //   "d": "Changing the money supply",
    //   "complexity": "Medium",
    //   "categoryId": "d55547fc-89ca-4077-912b-15182a9dbd1d",
    //   "categoryName": "Macroeconomics",
    //   "description": "Fiscal policy involves government spending and tax policies used to influence economic conditions."
    // },
    // {
    //   "id": "6a0f2c6b-1e23-4cc1-868e-4428dc87cc69",
    //   "question": "What happens during a recession?",
    //   "a": "The economy experiences a rapid growth in GDP",
    //   "b": "Unemployment rises and economic output decreases",
    //   "c": "The stock market becomes more stable",
    //   "d": "Inflation rates decrease significantly",
    //   "complexity": "Hard",
    //   "categoryId": "d55547fc-89ca-4077-912b-15182a9dbd1d",
    //   "categoryName": "Macroeconomics",
    //   "description": "A recession is a significant decline in economic activity, leading to increased unemployment and decreased economic output."
    // },
    // {
    //   "id": "42353fef-e4fd-4901-93f8-3f77dee08a60",
    //   "question": "What is the purpose of the World Trade Organization (WTO)?",
    //   "a": "To promote global peace",
    //   "b": "To ensure fair trade rules between countries",
    //   "c": "To regulate currency exchange rates",
    //   "d": "To monitor inflation worldwide",
    //   "complexity": "Easy",
    //   "categoryId": "383c567e-7e6e-4250-97a5-3106fa355e20",
    //   "categoryName": "International Economics",
    //   "description": "The WTO promotes global trade by setting rules and ensuring countries adhere to fair trade practices."
    // },
    // {
    //   "id": "bcf9b1c2-7281-4315-89be-65e19b86fd46",
    //   "question": "Which of the following is an example of a trade barrier?",
    //   "a": "Free trade agreements",
    //   "b": "Import quotas",
    //   "c": "Trade surpluses",
    //   "d": "Foreign direct investment",
    //   "complexity": "Medium",
    //   "categoryId": "383c567e-7e6e-4250-97a5-3106fa355e20",
    //   "categoryName": "International Economics",
    //   "description": "Trade barriers, such as import quotas, limit the amount of goods that can be imported into a country, protecting domestic industries."
    // },
    // {
    //   "id": "c49410cb-63a2-411c-908c-954321e48ce6",
    //   "question": "What does the term \"balance of payments\" refer to?",
    //   "a": "The total value of a country’s exports",
    //   "b": "The total amount of a country’s national debt",
    //   "c": "The financial record of all economic transactions between a country and the rest of the world",
    //   "d": "The interest rates charged on foreign loans",
    //   "complexity": "Hard",
    //   "categoryId": "383c567e-7e6e-4250-97a5-3106fa355e20",
    //   "categoryName": "International Economics",
    //   "description": "The balance of payments records all economic transactions between a country and other countries, including trade, investment, and financial flows."
    // },
    // {
    //   "id": "304ec23f-e3c0-4996-a8af-b6d24cc4f22d",
    //   "question": "What is the primary focus of sociology?",
    //   "a": "Human behavior in society",
    //   "b": "Economic systems",
    //   "c": "Political ideologies",
    //   "d": "Scientific research methods",
    //   "complexity": "Easy",
    //   "categoryId": "4bb71a45-3354-4a7e-8ee4-b5e00464e8dd",
    //   "categoryName": "Sociology",
    //   "description": "Sociology primarily focuses on the study of human behavior within societal contexts."
    // },
    // {
    //   "id": "3d563f01-41ee-41ae-81ec-c87a038c6512",
    //   "question": "Which of the following is a key principle of functionalism in sociology?",
    //   "a": "Social conflict leads to change",
    //   "b": "Society is a system of interrelated parts",
    //   "c": "Social inequality is inherent in society",
    //   "d": "Social behavior is shaped by individual psychology",
    //   "complexity": "Medium",
    //   "categoryId": "4bb71a45-3354-4a7e-8ee4-b5e00464e8dd",
    //   "categoryName": "Sociology",
    //   "description": "Functionalism views society as a system of interconnected parts that work together to maintain stability and order."
    // },
    // {
    //   "id": "83ac7eb2-51db-41ca-8fe9-e1cd08738e1d",
    //   "question": "Which sociological theory emphasizes the role of power and conflict in society?",
    //   "a": "Functionalism",
    //   "b": "Conflict theory",
    //   "c": "Symbolic interactionism",
    //   "d": "Social exchange theory",
    //   "complexity": "Hard",
    //   "categoryId": "4bb71a45-3354-4a7e-8ee4-b5e00464e8dd",
    //   "categoryName": "Sociology",
    //   "description": "Conflict theory focuses on power differentials and the role of conflict in shaping society."
    // },
    // {
    //   "id": "c5535064-3598-4ff0-84da-34aeb1beb6eb",
    //   "question": "What is the primary function of a government?",
    //   "a": "Maintain law and order",
    //   "b": "Provide healthcare",
    //   "c": "Control economic systems",
    //   "d": "Regulate individual rights",
    //   "complexity": "Easy",
    //   "categoryId": "d422db00-638e-4a20-be98-e0da4fe3595f",
    //   "categoryName": "Political Science",
    //   "description": "The primary function of government is to maintain law and order within its jurisdiction."
    // },
    // {
    //   "id": "3db8704a-b737-4637-8971-0603358bd172",
    //   "question": "Which political theory focuses on the role of the state in regulating the economy?",
    //   "a": "Liberalism",
    //   "b": "Marxism",
    //   "c": "Conservatism",
    //   "d": "Anarchism",
    //   "complexity": "Medium",
    //   "categoryId": "d422db00-638e-4a20-be98-e0da4fe3595f",
    //   "categoryName": "Political Science",
    //   "description": "Marxism advocates for state control over the economy to eliminate class distinctions and inequality."
    // },
    // {
    //   "id": "bb443b1e-89c0-4033-b45e-2ffeb69f74af",
    //   "question": "Who is considered the father of modern political science?",
    //   "a": "Thomas Hobbes",
    //   "b": "John Locke",
    //   "c": "Niccolò Machiavelli",
    //   "d": "Aristotle",
    //   "complexity": "Hard",
    //   "categoryId": "d422db00-638e-4a20-be98-e0da4fe3595f",
    //   "categoryName": "Political Science",
    //   "description": "Niccolò Machiavelli is often considered the father of modern political science due to his work on political theory and realpolitik."
    // },
    // {
    //   "id": "e2e38e5f-3195-49a4-ab9e-9e822d30b708",
    //   "question": "What is the primary focus of cognitive psychology?",
    //   "a": "Memory and learning",
    //   "b": "Emotions and behavior",
    //   "c": "Neurotransmitters and hormones",
    //   "d": "Social interactions",
    //   "complexity": "Easy",
    //   "categoryId": "80b2a037-05bd-467a-9aea-3fba0ee3498a",
    //   "categoryName": "Psychology",
    //   "description": "Cognitive psychology primarily focuses on mental processes such as memory, learning, and perception."
    // },
    // {
    //   "id": "e65ea9f3-8eca-4bee-8d20-1a826e8afd9d",
    //   "question": "Who is considered the father of modern psychology?",
    //   "a": "Sigmund Freud",
    //   "b": "John Watson",
    //   "c": "Wilhelm Wundt",
    //   "d": "Carl Rogers",
    //   "complexity": "Medium",
    //   "categoryId": "80b2a037-05bd-467a-9aea-3fba0ee3498a",
    //   "categoryName": "Psychology",
    //   "description": "Wilhelm Wundt is often referred to as the father of modern psychology due to his establishment of psychology as a science."
    // },
    // {
    //   "id": "994e07e6-790a-41e4-836b-ba290b2c2821",
    //   "question": "Which theory of personality is based on the unconscious mind and early childhood experiences?",
    //   "a": "Humanistic theory",
    //   "b": "Behaviorism",
    //   "c": "Psychoanalytic theory",
    //   "d": "Cognitive theory",
    //   "complexity": "Hard",
    //   "categoryId": "80b2a037-05bd-467a-9aea-3fba0ee3498a",
    //   "categoryName": "Psychology",
    //   "description": "The psychoanalytic theory, developed by Sigmund Freud, emphasizes the role of the unconscious mind and early childhood experiences in shaping personality."
    // },
    // {
    //   "id": "d7f57f29-beaa-47fa-b31f-df0971cc33ca",
    //   "question": "Who is known for the creation of the Mona Lisa?",
    //   "a": "Vincent van Gogh",
    //   "b": "Claude Monet",
    //   "c": "Pablo Picasso",
    //   "d": "Leonardo da Vinci",
    //   "complexity": "Easy",
    //   "categoryId": "c58ab374-cee2-4495-a909-125fdcb99239",
    //   "categoryName": "Visual Arts",
    //   "description": "The Mona Lisa is one of the most famous paintings, created by Leonardo da Vinci."
    // },
    // {
    //   "id": "d28a9013-0cff-4004-afd0-7bddd98bdf91",
    //   "question": "Which art movement is Salvador Dalí associated with?",
    //   "a": "Impressionism",
    //   "b": "Cubism",
    //   "c": "Surrealism",
    //   "d": "Renaissance",
    //   "complexity": "Medium",
    //   "categoryId": "c58ab374-cee2-4495-a909-125fdcb99239",
    //   "categoryName": "Visual Arts",
    //   "description": "Salvador Dalí is known for his surrealist works, often characterized by bizarre and dreamlike imagery."
    // },
    // {
    //   "id": "906705c0-8ea0-450f-bc53-cebc857fae49",
    //   "question": "Which artist is famous for the technique of drip painting?",
    //   "a": "Andy Warhol",
    //   "b": "Jackson Pollock",
    //   "c": "Mark Rothko",
    //   "d": "Georgia O’Keeffe",
    //   "complexity": "Hard",
    //   "categoryId": "c58ab374-cee2-4495-a909-125fdcb99239",
    //   "categoryName": "Visual Arts",
    //   "description": "Jackson Pollock is known for his drip paintings, a technique he pioneered in abstract expressionism."
    // },
    // {
    //   "id": "a73f09d4-db8e-4674-9763-5ece299fc6ea",
    //   "question": "Who is known as the King of Pop?",
    //   "a": "Michael Jackson",
    //   "b": "Elvis Presley",
    //   "c": "Madonna",
    //   "d": "Prince",
    //   "complexity": "Easy",
    //   "categoryId": "06d97864-24c8-431d-b07c-df34af337b58",
    //   "categoryName": "Performing Arts",
    //   "description": "Michael Jackson, known as the King of Pop, revolutionized the music industry with his music and dance moves."
    // },
    // {
    //   "id": "f9b0e39f-190d-49d3-9b1a-203d26c18acc",
    //   "question": "Which ballet dancer is famous for her performance in \"The Dying Swan\"?",
    //   "a": "Anna Pavlova",
    //   "b": "Mikhail Baryshnikov",
    //   "c": "Isadora Duncan",
    //   "d": "Sylvie Guillem",
    //   "complexity": "Medium",
    //   "categoryId": "06d97864-24c8-431d-b07c-df34af337b58",
    //   "categoryName": "Performing Arts",
    //   "description": "Anna Pavlova is best known for her portrayal of \"The Dying Swan,\" a role that became iconic in ballet."
    // },
    // {
    //   "id": "373f6756-7219-40dc-927c-8d4c24889cd0",
    //   "question": "Which play is considered William Shakespeares most famous tragedy?",
    //   "a": "Hamlet",
    //   "b": "Macbeth",
    //   "c": "Othello",
    //   "d": "King Lear",
    //   "complexity": "Hard",
    //   "categoryId": "06d97864-24c8-431d-b07c-df34af337b58",
    //   "categoryName": "Performing Arts",
    //   "description": "Shakespeares \"Hamlet\" is widely regarded as his most famous and influential tragedy."
    // },
    // {
    //   "id": "086e97a9-4982-4c66-81a0-5a8eb793c58e",
    //   "question": "Who composed the \"Fifth Symphony\"?",
    //   "a": "Ludwig van Beethoven",
    //   "b": "Johann Sebastian Bach",
    //   "c": "Wolfgang Amadeus Mozart",
    //   "d": "Frédéric Chopin",
    //   "complexity": "Easy",
    //   "categoryId": "c3953dab-d155-4224-a343-afcaabaed6a0",
    //   "categoryName": "Music",
    //   "description": "Beethoven's Fifth Symphony is one of the most famous symphonic works in Western classical music."
    // },
    // {
    //   "id": "ee7c2249-0e2c-408b-877d-2cba31c03016",
    //   "question": "Which of these instruments is part of the woodwind family?",
    //   "a": "Trumpet",
    //   "b": "Saxophone",
    //   "c": "Timpani",
    //   "d": "Cello",
    //   "complexity": "Medium",
    //   "categoryId": "c3953dab-d155-4224-a343-afcaabaed6a0",
    //   "categoryName": "Music",
    //   "description": "The saxophone, despite being made of brass, is considered part of the woodwind family due to its use of a reed."
    // },
    // {
    //   "id": "d93ac75e-a2f3-48a6-87ff-705d4a463c04",
    //   "question": "What genre of music did The Beatles revolutionize in the 1960s?",
    //   "a": "Rock and Roll",
    //   "b": "Jazz",
    //   "c": "Pop",
    //   "d": "Country",
    //   "complexity": "Hard",
    //   "categoryId": "c3953dab-d155-4224-a343-afcaabaed6a0",
    //   "categoryName": "Music",
    //   "description": "The Beatles are often credited with revolutionizing Rock and Roll during the 1960s with their innovative music and style."
    // },
    // {
    //   "id": "6b157afe-a13c-4fc6-9307-3b963f39a073",
    //   "question": "What is the definition of consumer behavior?",
    //   "a": "The study of the human brain",
    //   "b": "The study of consumer decision-making",
    //   "c": "The study of product manufacturing",
    //   "d": "The study of economic policies",
    //   "complexity": "easy",
    //   "categoryId": "d026b7d3-d173-4187-a416-832b86906dfe",
    //   "categoryName": "Consumer Behavior",
    //   "description": "An introductory question to define consumer behavior."
    // },
    // {
    //   "id": "5bcc0418-f264-451d-92b7-8cc0f0978b80",
    //   "question": "Which factor does NOT influence consumer behavior?",
    //   "a": "Cultural factors",
    //   "b": "Social factors",
    //   "c": "Psychological factors",
    //   "d": "Lunar phases",
    //   "complexity": "medium",
    //   "categoryId": "d026b7d3-d173-4187-a416-832b86906dfe",
    //   "categoryName": "Consumer Behavior",
    //   "description": "A question testing knowledge on factors influencing consumer behavior."
    // },
    // {
    //   "id": "52628219-9c34-45d5-a1b8-bd26a2112b2f",
    //   "question": "What is an example of post-purchase behavior in consumer decision-making?",
    //   "a": "Considering alternative options",
    //   "b": "Comparing prices before buying",
    //   "c": "Feeling satisfied or dissatisfied after the purchase",
    //   "d": "Browsing for similar products",
    //   "complexity": "hard",
    //   "categoryId": "d026b7d3-d173-4187-a416-832b86906dfe",
    //   "categoryName": "Consumer Behavior",
    //   "description": "A challenging question focusing on post-purchase consumer behavior."
    // },
    // {
    //   "id": "ea65b3a6-bde6-4c4d-8bf1-ec7180fef5b2",
    //   "question": "What is the law of demand?",
    //   "a": "Price and demand are directly related",
    //   "b": "Price and demand are inversely related",
    //   "c": "Price has no effect on demand",
    //   "d": "Demand increases with supply",
    //   "complexity": "easy",
    //   "categoryId": "f9d7ed88-8dc4-4e60-8dc8-59af1084b9d3",
    //   "categoryName": "Supply and Demand",
    //   "description": "A basic question introducing the law of demand."
    // },
    // {
    //   "id": "9a8c5d01-4b40-49aa-99fb-419130095656",
    //   "question": "What happens to the equilibrium price when supply increases and demand remains constant?",
    //   "a": "Equilibrium price increases",
    //   "b": "Equilibrium price decreases",
    //   "c": "Equilibrium price stays the same",
    //   "d": "Equilibrium price fluctuates randomly",
    //   "complexity": "medium",
    //   "categoryId": "f9d7ed88-8dc4-4e60-8dc8-59af1084b9d3",
    //   "categoryName": "Supply and Demand",
    //   "description": "A question testing understanding of supply-demand equilibrium."
    // },
    // {
    //   "id": "2534e4b7-9ed6-4b5d-a735-403518775c4c",
    //   "question": "If a government imposes a price ceiling below the equilibrium price, what is the likely outcome?",
    //   "a": "Surplus of goods",
    //   "b": "Shortage of goods",
    //   "c": "No effect on the market",
    //   "d": "Increased production",
    //   "complexity": "hard",
    //   "categoryId": "f9d7ed88-8dc4-4e60-8dc8-59af1084b9d3",
    //   "categoryName": "Supply and Demand",
    //   "description": "A challenging question on government intervention and market equilibrium."
    // },
    // {
    //   "id": "02a60f06-3fb9-43b1-93f5-ac6d07d65abe",
    //   "question": "What does an exchange rate represent?",
    //   "a": "The value of one currency compared to another",
    //   "b": "The amount of goods traded between two countries",
    //   "c": "The total GDP of a country",
    //   "d": "The interest rate charged by central banks",
    //   "complexity": "easy",
    //   "categoryId": "7c8532d8-e722-4467-b67a-ecfa2d98cf1b",
    //   "categoryName": "Exchange Rates",
    //   "description": "A basic introduction to the concept of exchange rates."
    // },
    // {
    //   "id": "800b9641-8bfb-4da7-b263-bfaa18168480",
    //   "question": "If a country’s currency appreciates, what is the likely impact on its exports?",
    //   "a": "Exports become cheaper for foreign buyers",
    //   "b": "Exports become more expensive for foreign buyers",
    //   "c": "No effect on exports",
    //   "d": "Exports will increase significantly",
    //   "complexity": "medium",
    //   "categoryId": "7c8532d8-e722-4467-b67a-ecfa2d98cf1b",
    //   "categoryName": "Exchange Rates",
    //   "description": "A question about the relationship between currency appreciation and exports."
    // },
    // {
    //   "id": "72d1b8fb-c881-40da-9a22-a11f49c92a45",
    //   "question": "Which of the following could cause a depreciation in a country’s currency?",
    //   "a": "Increase in interest rates",
    //   "b": "Trade surplus",
    //   "c": "High inflation rates",
    //   "d": "Strong foreign direct investment",
    //   "complexity": "hard",
    //   "categoryId": "7c8532d8-e722-4467-b67a-ecfa2d98cf1b",
    //   "categoryName": "Exchange Rates",
    //   "description": "A challenging question focusing on the factors affecting currency depreciation."
    // },
    // {
    //   "id": "f9cc2ce9-e4d5-4fb8-806a-d8733afd8d90",
    //   "question": "What is the main goal of trade policies?",
    //   "a": "To promote international peace",
    //   "b": "To regulate trade between countries",
    //   "c": "To stabilize global currencies",
    //   "d": "To reduce domestic inflation",
    //   "complexity": "easy",
    //   "categoryId": "ece6a185-86d9-4c9d-ad39-813dac31f238",
    //   "categoryName": "Trade Policies",
    //   "description": "A basic question about the purpose of trade policies."
    // }
  ];


  totalTimeInMinutes!: number; // Total test time in minutes
  remainingTime!: string ; // Remaining time in mm:ss format
  private totalTimeInSeconds: number = 0; // Total test time in seconds
  private timerSubscription: Subscription | null = null;

  constructor(private cdr: ChangeDetectorRef, private route : ActivatedRoute,private testSeriesService: TestSeriesService, private router: Router, private toastr: ToastrService, public sanitizer: DomSanitizer) {
    
  }


  ngOnInit(): void {
    // this.initilizeEditor();
    const back = this.getCourseId();
    
    window.onload = function() {
      if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
          // Redirect to the homepage if the page was reloaded
          window.location.href = `/dash/course-detail/${back}`; // Or the path to your homepage
      }
  };

    this.getTestPaper();

  }


  initilizeEditor() {
    // Initialize Quill Editor
    const editors = [{id: '#questionEditor', placeholder: 'Write question content here...'}, {id:'#optionAEditor', placeholder: 'Write option A content here...'}, {id:'#optionBEditor', placeholder: 'Write option B content here...'}, {id:'#optionCEditor', placeholder: 'Write option C content here...'}, {id:'#optionDEditor', placeholder: 'Write option D content here...'}]
    this.quillEditor =  editors.map((obj) => {
     return  new Quill(obj.id, {
       theme: 'snow',
       readOnly: true,
      //  placeholder: obj.placeholder,
       modules: {
         toolbar: [
          //  // Font family
          //  [{ font: [] }],
 
          //  // Font size
          //  [{ size: [] }],
 
          //  // Text formatting
          //  ['bold', 'italic', 'underline', 'strike'], // Bold, italic, underline, strike
          //  [{ script: 'sub' }, { script: 'super' }], // Subscript, superscript
          //  [{ color: [] }, { background: [] }], // Text and background colors
 
          //  // Headers and block styles
          //  [{ header: [1, 2, 3, 4, 5, 6, false] }], // Headers (H1-H6)
          //  ['blockquote', 'code-block'], // Blockquote and code block
 
          //  // Lists and Indentation
          //  [{ list: 'ordered' }, { list: 'bullet' }], // Ordered and unordered lists
          //  [{ indent: '-1' }, { indent: '+1' }], // Indentation
 
          //  // Alignment and Direction
          //  [{ align: [] }], // Align left, center, right, justify
          //  [{ direction: 'rtl' }], // RTL text direction
 
          //  // Links, media, and more
          //  ['link', 'image', 'video', 'formula'], // Links, images, videos, formulas
 
          //  ['table'], // Table operations
 
          //  // Clear formatting
          //  ['clean'], // Clear formatting
         ],
        //  table: true, // Enable table module
       },
     });

    })
 }





  startTestTimer(): void {
    // Convert total time to seconds
    this.totalTimeInSeconds = this.totalTimeInMinutes * 60;

    // Create an RxJS interval that emits every second
    this.timerSubscription = interval(1000)
      .pipe(take(this.totalTimeInSeconds)) // Emit values only for the test duration
      .subscribe({
        next: () => {
          this.totalTimeInSeconds--;
          this.remainingTime = this.formatTime(this.totalTimeInSeconds);

           // Trigger alerts at specific times
          if (this.totalTimeInSeconds === 600) {
            this.toastr.warning('10 minutes left!.');
          } else if (this.totalTimeInSeconds === 300) {
            this.toastr.warning('5 minutes left!.');
          } else if (this.totalTimeInSeconds === 60) {
            this.toastr.warning('1 minutes left!.');
          }

          if (this.totalTimeInSeconds === 0) {
            this.onTestComplete();
          }
        },
        error: (err) => console.error(err),
        complete: () => {}
      });
  }

  clearTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  onTestComplete(): void {
    alert("Time's up! Submitting the test...");
    this.submitTest();

   
  }

 
  
  


  getActiveQuestion(id:any) {
    this.currentQuestioNumber = [id];
  }

  review() {
    // this.toastr.warning("hello")
      // Get the current question using its index in the questions array
      const currentIndex = this.questions.findIndex((q:any) => q.id === this.currentQuestion.id);
      const currentQuestion = this.questions[currentIndex];
    this.reviewArray.push(this.currentQuestion.id)
       // Move to the next question after saving
       this.moveToNextQuestion();
  }


  saveAnswer() {
    if (this.selectedAnswer) {
      // Get the current question using its index in the questions array
      const currentIndex = this.questions.findIndex((q:any) => q.id === this.currentQuestion.id);
      const currentQuestion = this.questions[currentIndex];

      if(this.reviewArray.includes(this.currentQuestion.id)) {
        const currentReviewIndex = this.reviewArray.findIndex((id:any) => id === this.currentQuestion.id);
        this.reviewArray.splice(currentReviewIndex, 1);
        
      }
  
      // Add the selected answer with the label to the question object
      currentQuestion['ans'] = this.selectedAnswer;
  
      // Save the answer to the answeredArray
      this.answeredArray.push(this.currentQuestion.id);
  
  
      // Move to the next question after saving
      this.moveToNextQuestion();
    }
  }


  moveToNextQuestion() {
    // // Logic to move to the next question
    // const currentIndex = this.questions.indexOf(this.currentQuestion);
    // if (currentIndex < this.questions.length - 1) {
    //   this.currentQuestion = this.questions[currentIndex + 1];
    //   this.getActiveQuestion(this.currentQuestion.id)
    //   this.selectedAnswer = null; // Reset the selected answer for the next question
    // }

      // Logic to move to the next question
  const currentIndex = this.questions.indexOf(this.currentQuestion);
  if (currentIndex < this.questions.length - 1) {
    // Move to the next question
    this.currentQuestion = this.questions[currentIndex + 1];

    if (this.quillEditor && this.quillEditor.length > 0) {
      this.quillEditor[0].root.innerHTML = this.currentQuestion.question;
      this.quillEditor[1].root.innerHTML = this.currentQuestion.a;
      this.quillEditor[2].root.innerHTML = this.currentQuestion.b;
      this.quillEditor[3].root.innerHTML = this.currentQuestion.c;
      this.quillEditor[4].root.innerHTML = this.currentQuestion.d;
  

    }
    this.cdr.detectChanges();


    this.getActiveQuestion(this.currentQuestion.id);
    
    // Check if the next question has an 'ans' property and set selectedAnswer
    if (this.currentQuestion.ans) {
      this.selectedAnswer = this.currentQuestion.ans;  // Set the selected answer to the value of ans
    } else {
      this.selectedAnswer = null;  // Reset if no ans key exists
    }
  }
  }



  gotToQuestion(ques: any) {
    this.getActiveQuestion(ques.id)
    this.currentQuestion = ques;
    if (this.quillEditor && this.quillEditor.length > 0) {
      this.quillEditor[0].root.innerHTML = this.currentQuestion.question;
      this.quillEditor[1].root.innerHTML = this.currentQuestion.a;
      this.quillEditor[2].root.innerHTML = this.currentQuestion.b;
      this.quillEditor[3].root.innerHTML = this.currentQuestion.c;
      this.quillEditor[4].root.innerHTML = this.currentQuestion.d;
  

    }
    this.cdr.detectChanges();
    this.selectedAnswer = ques.ans
  }


  convertTimeToRemainingFormat(duration: string): { totalTimeInMinutes: number; remainingTime: string } {
    // Extract the number of minutes from the input string
    const minutes = parseInt(duration.replace("min", "").trim(), 10);
  
    if (isNaN(minutes) ||  minutes < 0) {
      throw new Error("Invalid duration format. Expected format: 'XX min' or duration must be a non-negative number.");
    }
  
    // Calculate total time in minutes
    const totalTimeInMinutes = minutes;
  
    // Convert to mm:ss format (no hours, only minutes and seconds)
     const remainingTime = `${String(minutes).padStart(2, '0')}:00`;
  
    return { totalTimeInMinutes, remainingTime };
  }
  

 
  submitTest() {

    this.loading = true; // Start loading
   console.log(this.questions)

    this.testSeriesService
      .submitTest(this.getUserId(), this.getTestId(), this.questions)
      .pipe(
        tap((response) => {
          // this.testSeriesDetails =  response.response
          
        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          
        
          this.loading = false; // Stop loading
         
          // this.router.navigateByUrl(`dash/course-list`);
          this.backToCourse()
          // //  this.router.navigateByUrl(`dash/test/${val.id}`);
          // // this.router.navigate(['dash/test', val.id], { queryParams: { key1: 'value1', key2: 'value2' } });
        })
      )
      .subscribe();
  }

  backToCourse() {
    this.router.navigateByUrl(`dash/course-detail/${this.getCourseId()}`);
  }

  // getTest() {
  //   this.loading = true; // Start loading
   

  //   this.testSeriesService
  //     .getTestById(this.getTestId())
  //     .pipe(
  //       tap((response) => {
  //         if(response) {
  //           const timer = this.convertTimeToRemainingFormat(response.duration);
  //           this.totalTimeInMinutes = timer.totalTimeInMinutes; // Total test time in minutes
  //           this.remainingTime = timer.remainingTime; // Remaining time in mm:ss format
    
  //           this.testDetails = response
  //         }
          
  //       }),
  //       catchError((error) => {
  //         console.error('Error:', error);
  //         return of(error); // Return an observable to handle the error
  //       }),
  //       finalize(() => {
          
        
  //         this.loading = false; // Stop loading
         
       
  //         this.startTestTimer();

          
  //       })
  //     )
  //     .subscribe();
  // }


  // getTestPaper() {
  //   this.loading = true; // Start loading
   

  //   this.testSeriesService
  //     .getTestPaperById(this.getTestId())
  //     .pipe(
  //       tap((response) => {
  //         this.questions = response;
  //         this.getActiveQuestion(this.questions[0].id)
  //         this.currentQuestion = this.questions[0];
  //         // console.log(this.quillEditor)
  //         if (this.quillEditor && this.quillEditor.length > 0) {
  //           this.quillEditor[0].root.innerHTML = this.currentQuestion.question;
  //           this.quillEditor[1].root.innerHTML = this.currentQuestion.a;
  //           this.quillEditor[2].root.innerHTML = this.currentQuestion.b;
  //           this.quillEditor[3].root.innerHTML = this.currentQuestion.c;
  //           this.quillEditor[4].root.innerHTML = this.currentQuestion.d;
        
    
  //         }
  //         this.cdr.detectChanges();

  //         // if (this.quillEditor && this.quillEditor.root) {

  //         //   this.quillEditor.root.innerHTML = response.blogContent
  //         // }
  //         // this.cdr.detectChanges();
          
  //       }),
  //       catchError((error) => {
  //         console.error('Error:', error);
  //         return of(error); // Return an observable to handle the error
  //       }),
  //       finalize(() => {
          
        
  //         this.loading = false; // Stop loading
         
  //         console.log("hello")
  //         this.startTestTimer();

          
  //       })
  //     )
  //     .subscribe();
  // }


  getTestPaper() {
    this.loading = true; // Start loading
  
    // Define the two API calls
    const getTest$ = this.testSeriesService.getTestById(this.getTestId()).pipe(
      catchError((error) => {
        console.error('Error in getTestById:', error);
        return of(null); // Handle error and return a fallback value
      })
    );
  
    const getTestPaper$ = this.testSeriesService.getTestPaperById(this.getTestId()).pipe(
      catchError((error) => {
        console.error('Error in getTestPaperById:', error);
        return of(null); // Handle error and return a fallback value
      })
    );
  
    // Use forkJoin to combine the API calls
    forkJoin([getTest$, getTestPaper$])
      .pipe(
        tap(([testResponse, TestPaperResponse]) => {
          // Process the response of both APIs
          // console.log('Test Paper Response:', TestPaperResponse);
          // console.log('Test  Response:', testResponse);

          if(testResponse) {
            const timer = this.convertTimeToRemainingFormat(testResponse.duration);
            this.totalTimeInMinutes = timer.totalTimeInMinutes; // Total test time in minutes
            this.remainingTime = timer.remainingTime; // Remaining time in mm:ss format
    
            this.testDetails = testResponse
          }

  
          if (TestPaperResponse) {
            this.questions = TestPaperResponse;
            this.getActiveQuestion(this.questions[0].id);
            this.currentQuestion = this.questions[0];
  
            // if (this.quillEditor && this.quillEditor.length > 0) {
            //   this.quillEditor[0].root.innerHTML = this.currentQuestion.question;
            //   this.quillEditor[1].root.innerHTML = this.currentQuestion.a;
            //   this.quillEditor[2].root.innerHTML = this.currentQuestion.b;
            //   this.quillEditor[3].root.innerHTML = this.currentQuestion.c;
            //   this.quillEditor[4].root.innerHTML = this.currentQuestion.d;
            // }
          }
  
          
  
          this.cdr.detectChanges(); // Trigger change detection
        }),
        finalize(() => {
          this.loading = false; // Stop loading once both APIs complete
          this.startTestTimer(); // Start the timer after APIs complete
        })
      )
      .subscribe();
  }



  getTestId() {
    return this.route.snapshot.params['id']
  }

  getCourseId() {
    return this.route.snapshot.params['courseId']
  }


  getUserId() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null').response.userId
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }
}
